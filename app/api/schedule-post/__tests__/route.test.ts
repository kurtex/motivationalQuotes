import { POST } from '../route';
import { NextRequest } from 'next/server';
import { connectToDB } from '@/app/lib/database/db';
import ScheduledPost from '@/app/lib/database/models/ScheduledPost';
import { getCookie } from '@/app/lib/utils/cookies/actions';
import User from '@/app/lib/database/models/User';
import { getMetaUserIdByThreadsAccessToken } from '@/app/lib/database/actions';
import { calculateNextScheduledAt } from '@/app/lib/utils/schedule/calculateNextScheduledAt';

// --- Start of new mock setup ---
const mockSave = jest.fn().mockResolvedValue(true);
const mockScheduledPostInstance = { save: mockSave };

jest.mock('@/app/lib/database/models/ScheduledPost', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockScheduledPostInstance),
}));
(ScheduledPost as any).findOne = jest.fn();
// --- End of new mock setup ---

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
    })),
  },
}));
jest.mock('@/app/lib/database/db');
jest.mock('@/app/lib/utils/cookies/actions');
jest.mock('@/app/lib/database/models/User');
jest.mock('@/app/lib/database/actions');
jest.mock('@/app/lib/utils/schedule/calculateNextScheduledAt');

const mockedConnectToDB = connectToDB as jest.Mock;
const mockedScheduledPostFindOne = (ScheduledPost as any).findOne as jest.Mock;
const mockedGetCookie = getCookie as jest.Mock;
const mockedUserFindOne = User.findOne as jest.Mock;
const mockedGetMetaUserId = getMetaUserIdByThreadsAccessToken as jest.Mock;
const mockedCalculateNext = calculateNextScheduledAt as jest.Mock;

describe('POST /api/schedule-post', () => {
  let mockRequest: Partial<NextRequest>;
  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      json: jest.fn(),
    };
    mockedGetCookie.mockResolvedValue('mock-threads-token');
    mockedGetMetaUserId.mockResolvedValue('mock-meta-user-id');
    mockedUserFindOne.mockResolvedValue({ _id: 'mock-user-id' });
    mockedCalculateNext.mockReturnValue(mockDate);
    mockedScheduledPostFindOne.mockResolvedValue(null); // Default to creating a new schedule
  });

  describe('Happy Path', () => {
    it('should create a new schedule successfully', async () => {
      const body = {
        scheduleType: 'daily',
        timeOfDay: '09:00',
        timeZoneId: 'America/New_York',
      };
      (mockRequest.json as jest.Mock).mockResolvedValue(body);

      const response = await POST(mockRequest as NextRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.message).toBe('Schedule updated successfully');
      expect(mockedConnectToDB).toHaveBeenCalled();
      expect(mockedUserFindOne).toHaveBeenCalledWith({ meta_user_id: 'mock-meta-user-id' });
      expect(mockedCalculateNext).toHaveBeenCalledWith(
        body.scheduleType,
        body.timeOfDay,
        body.timeZoneId,
        undefined,
        undefined
      );
      // Check that the constructor was called
      expect(ScheduledPost).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'mock-user-id',
        scheduleType: body.scheduleType,
        timeOfDay: body.timeOfDay,
        nextScheduledAt: mockDate,
        status: 'active',
      }));
      // Check that save was called on the instance
      expect(mockSave).toHaveBeenCalled();
    });

    it('should update an existing schedule successfully', async () => {
        const existingSchedule = {
            ...mockScheduledPostInstance,
            scheduleType: 'daily',
            timeOfDay: '08:00',
            timeZoneId: 'UTC',
            status: 'paused',
        };
        mockedScheduledPostFindOne.mockResolvedValue(existingSchedule);

        const body = {
            scheduleType: 'custom',
            timeOfDay: '12:00',
            timeZoneId: 'Europe/London',
            intervalValue: 2,
            intervalUnit: 'days',
        };
        (mockRequest.json as jest.Mock).mockResolvedValue(body);

        await POST(mockRequest as NextRequest);

        expect(mockedScheduledPostFindOne).toHaveBeenCalledWith({ userId: 'mock-user-id' });
        expect(ScheduledPost).not.toHaveBeenCalled(); // Constructor should not be called for updates
        expect(existingSchedule.scheduleType).toBe(body.scheduleType);
        expect(existingSchedule.timeOfDay).toBe(body.timeOfDay);
        expect(existingSchedule.status).toBe('active');
        expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    const baseValidBody = {
      scheduleType: 'daily',
      timeOfDay: '10:00',
      timeZoneId: 'UTC',
    };

    it('should return 400 if request body is invalid', async () => {
      const { scheduleType, ...invalidBody } = baseValidBody; // Missing scheduleType
      (mockRequest.json as jest.Mock).mockResolvedValue(invalidBody);
      const response = await POST(mockRequest as NextRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.error).toBe('Invalid request data');
      expect(jsonResponse.issues.fieldErrors.scheduleType).toBeDefined();
    });

    it('should return 400 if timeOfDay is invalid', async () => {
      const invalidBody = { ...baseValidBody, timeOfDay: '99:99' };
      (mockRequest.json as jest.Mock).mockResolvedValue(invalidBody);
      const response = await POST(mockRequest as NextRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.issues.fieldErrors.timeOfDay).toContain("Invalid time format, expected HH:MM");
    });

    it('should return 400 for custom schedule with missing intervalValue', async () => {
      const invalidBody = {
        ...baseValidBody,
        scheduleType: 'custom',
        intervalUnit: 'days',
      };
      (mockRequest.json as jest.Mock).mockResolvedValue(invalidBody);
      const response = await POST(mockRequest as NextRequest);
      const jsonResponse = await response.json();
      
      expect(response.status).toBe(400);
      expect(jsonResponse.issues.fieldErrors.intervalValue).toContain('Interval value is required for custom schedule');
    });
  });

  describe('Authorization', () => {
    it('should return 401 if threads-token is missing', async () => {
        mockedGetCookie.mockResolvedValue(null);
        (mockRequest.json as jest.Mock).mockResolvedValue({
            scheduleType: 'daily',
            timeOfDay: '09:00',
            timeZoneId: 'America/New_York',
        });
        const response = await POST(mockRequest as NextRequest);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized: No Threads token found' });
    });
  });
});