import * as actions from '../actions';
import apiClient from '../../apiClient';
import { getCookie } from '../../../utils/cookies/actions';
import { EThreadsAuthEndpoints } from '../../EThreadsEndpoints';

// Mock dependencies
jest.mock('../../apiClient');
jest.mock('../../../utils/cookies/actions');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedGetCookie = getCookie as jest.Mock;

describe('Threads Posts Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('createThreadTextContainer', () => {
        it('should create a text container successfully', async () => {
            const mockResponse = { data: { id: 'container-123' } };
            mockedApiClient.post.mockResolvedValue(mockResponse);

            const containerId = await actions.createThreadTextContainer('My post', 'access-token');

            expect(containerId).toBe('container-123');
            expect(mockedApiClient.post).toHaveBeenCalledWith(
                EThreadsAuthEndpoints.NEW_TEXT_CONTAINER,
                null,
                {
                    params: {
                        text: 'My post',
                        media_type: 'text',
                        access_token: 'access-token',
                    },
                }
            );
        });

        it('should handle errors when creating a container', async () => {
            mockedApiClient.post.mockRejectedValue(new Error('API error'));
            await expect(actions.createThreadTextContainer('My post', 'access-token')).rejects.toThrow('API error');
        });
    });

    describe('postThreadsTextContainer', () => {
        it('should post a container successfully', async () => {
            mockedApiClient.post.mockResolvedValue({ status: 200 });
            const result = await actions.postThreadsTextContainer('container-123', 'access-token');

            expect(result).toBe(true);
            expect(mockedApiClient.post).toHaveBeenCalledWith(
                EThreadsAuthEndpoints.POST_TEXT_CONTAINER,
                null,
                {
                    params: {
                        creation_id: 'container-123',
                        access_token: 'access-token',
                    },
                }
            );
        });

        it('should handle errors when posting a container', async () => {
            mockedApiClient.post.mockRejectedValue(new Error('API error'));
            await expect(actions.postThreadsTextContainer('container-123', 'access-token')).rejects.toThrow('API error');
        });
    });

    describe('getThreadsCookie', () => {
        it('should return the access token if the cookie exists', async () => {
            mockedGetCookie.mockResolvedValue('cookie-token');
            const token = await actions.getThreadsCookie();
            expect(token).toBe('cookie-token');
        });

        it('should throw an error if the cookie does not exist', async () => {
            mockedGetCookie.mockResolvedValue(null);
            await expect(actions.getThreadsCookie()).rejects.toThrow('Access token is required');
        });
    });

    describe('postThreadAction', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            mockedApiClient.post.mockImplementation(async (url) => {
                if (url === EThreadsAuthEndpoints.NEW_TEXT_CONTAINER) {
                    return { data: { id: 'container-456' } };
                }
                if (url === EThreadsAuthEndpoints.POST_TEXT_CONTAINER) {
                    return { status: 200 };
                }
                return {};
            });
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should post a thread from FormData', async () => {
            const formData = new FormData();
            formData.append('thread_post', 'New thread content');

            mockedGetCookie.mockResolvedValue('access-token-from-cookie');

            const actionPromise = actions.postThreadAction(formData);

            await jest.runAllTimersAsync();

            await actionPromise;

            expect(mockedApiClient.post).toHaveBeenCalledWith(
                EThreadsAuthEndpoints.NEW_TEXT_CONTAINER,
                null,
                {
                    params: {
                        text: 'New thread content',
                        media_type: 'text',
                        access_token: 'access-token-from-cookie',
                    },
                }
            );

            expect(mockedApiClient.post).toHaveBeenCalledWith(
                EThreadsAuthEndpoints.POST_TEXT_CONTAINER,
                null,
                {
                    params: {
                        creation_id: 'container-456',
                        access_token: 'access-token-from-cookie',
                    },
                }
            );
        });

        it('should throw an error if access token is missing', async () => {
            const formData = new FormData();
            formData.append('thread_post', 'New thread content');
            mockedGetCookie.mockResolvedValue(null);

            await expect(actions.postThreadAction(formData)).rejects.toThrow('Access token is required');
        });
    });
});
