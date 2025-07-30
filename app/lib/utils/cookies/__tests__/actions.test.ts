import { createCookie, getCookie } from '../actions';
import { cookies } from 'next/headers';

// Mock next/headers
jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

describe('Cookie Actions', () => {
    let mockSet: jest.Mock;
    let mockGet: jest.Mock;

    beforeEach(() => {
        mockSet = jest.fn();
        mockGet = jest.fn();
        (cookies as jest.Mock).mockReturnValue({
            set: mockSet,
            get: mockGet,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCookie', () => {
        it('should set a cookie with the provided data', async () => {
            const cookieData = {
                name: 'test-cookie',
                value: 'test-value',
                httpOnly: true,
                secure: true,
                path: '/',
            };
            await createCookie(cookieData);
            expect(mockSet).toHaveBeenCalledWith(cookieData);
        });
    });

    describe('getCookie', () => {
        it('should return the cookie value if it exists', async () => {
            mockGet.mockReturnValue({ value: 'retrieved-value' });
            const value = await getCookie('test-cookie');
            expect(value).toBe('retrieved-value');
            expect(mockGet).toHaveBeenCalledWith('test-cookie');
        });

        it('should return null if the cookie does not exist', async () => {
            mockGet.mockReturnValue(undefined);
            const value = await getCookie('non-existent-cookie');
            expect(value).toBeNull();
            expect(mockGet).toHaveBeenCalledWith('non-existent-cookie');
        });
    });
});