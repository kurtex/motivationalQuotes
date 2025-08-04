import {
    getShortLivedToken,
    getLongLivedToken,
    refreshLongLivedToken,
    redirectURI,
} from '../actions';
import apiClient from '../../apiClient';
import { EThreadsAuthEndpoints } from '../../EThreadsEndpoints';

// Mock apiClient
jest.mock('../../apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Token Actions', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
            NEXT_PUBLIC_CLIENT_ID: 'mock-client-id',
            CLIENT_SECRET: 'mock-client-secret',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    describe('getShortLivedToken', () => {
        it('should fetch a short-lived token successfully', async () => {
            const mockResponse = { data: { access_token: 'short-lived', user_id: '123' } };
            mockedApiClient.post.mockResolvedValue(mockResponse);

            const result = await getShortLivedToken('auth-code');

            expect(result).toEqual(mockResponse.data);
            expect(mockedApiClient.post).toHaveBeenCalledWith(
                EThreadsAuthEndpoints.SHORT_LIVED_TOKEN,
                null,
                {
                    params: {
                        client_id: 'mock-client-id',
                        client_secret: 'mock-client-secret',
                        code: 'auth-code',
                        grant_type: 'authorization_code',
                        redirect_uri: redirectURI,
                    },
                }
            );
        });

        it('should handle errors when fetching a short-lived token', async () => {
            mockedApiClient.post.mockRejectedValue(new Error('Network error'));
            await expect(getShortLivedToken('auth-code')).rejects.toThrow('Network error');
        });
    });

    describe('getLongLivedToken', () => {
        it('should fetch a long-lived token successfully', async () => {
            const mockResponse = { data: { access_token: 'long-lived', token_type: 'bearer', expires_in: 5184000 } };
            mockedApiClient.get.mockResolvedValue(mockResponse);

            const result = await getLongLivedToken('short-lived-token');

            expect(result).toEqual(mockResponse.data);
            expect(mockedApiClient.get).toHaveBeenCalledWith(
                EThreadsAuthEndpoints.LONG_LIVED_TOKEN,
                {
                    params: {
                        client_secret: 'mock-client-secret',
                        grant_type: 'th_exchange_token',
                        access_token: 'short-lived-token',
                    },
                }
            );
        });

        it('should handle errors when fetching a long-lived token', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Network error'));
            await expect(getLongLivedToken('short-lived-token')).rejects.toThrow('Network error');
        });
    });

    describe('refreshLongLivedToken', () => {
        it('should refresh a long-lived token successfully', async () => {
            const mockResponse = { data: { access_token: 'refreshed-long-lived', token_type: 'bearer', expires_in: 5184000 } };
            mockedApiClient.get.mockResolvedValue(mockResponse);

            const result = await refreshLongLivedToken('long-lived-token');

            expect(result).toEqual(mockResponse.data);
            expect(mockedApiClient.get).toHaveBeenCalledWith(
                EThreadsAuthEndpoints.REFRESH_LONG_LIVE_TOKEN,
                {
                    params: {
                        grant_type: 'th_refresh_token',
                        access_token: 'long-lived-token',
                    },
                }
            );
        });

        it('should handle errors when refreshing a long-lived token', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Network error'));
            await expect(refreshLongLivedToken('long-lived-token')).rejects.toThrow('Network error');
        });
    });
});
