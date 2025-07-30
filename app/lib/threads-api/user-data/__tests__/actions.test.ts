import { getThreadsUsername } from '../actions';
import apiClient from '../../apiClient';
import { EThreadsAuthEndpoints } from '../../EThreadsEndpoints';

// Mock apiClient
jest.mock('../../apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('User Data Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getThreadsUsername', () => {
        it('should return the username on successful fetch', async () => {
            const mockUsername = 'testuser';
            const mockResponse = { data: { username: mockUsername } };
            mockedApiClient.get.mockResolvedValue(mockResponse);

            const username = await getThreadsUsername('access-token');

            expect(username).toBe(mockUsername);
            expect(mockedApiClient.get).toHaveBeenCalledWith(
                EThreadsAuthEndpoints.USER_DATA,
                {
                    params: {
                        fields: 'username',
                        access_token: 'access-token',
                    },
                }
            );
        });

        it('should handle errors when fetching username', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('API error'));
            await expect(getThreadsUsername('access-token')).rejects.toThrow('API error');
        });
    });
});
