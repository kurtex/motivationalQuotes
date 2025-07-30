import {
    createThreadTextContainer,
    postThreadsTextContainer,
    getThreadsCookie,
    postThreadAction,
} from '../actions';
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

            const containerId = await createThreadTextContainer('My post', 'access-token');

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
            await expect(createThreadTextContainer('My post', 'access-token')).rejects.toThrow('API error');
        });
    });

    describe('postThreadsTextContainer', () => {
        it('should post a container successfully', async () => {
            mockedApiClient.post.mockResolvedValue({ status: 200 });
            const result = await postThreadsTextContainer('container-123', 'access-token');

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
            await expect(postThreadsTextContainer('container-123', 'access-token')).rejects.toThrow('API error');
        });
    });

    describe('getThreadsCookie', () => {
        it('should return the access token if the cookie exists', async () => {
            mockedGetCookie.mockResolvedValue('cookie-token');
            const token = await getThreadsCookie();
            expect(token).toBe('cookie-token');
        });

        it('should throw an error if the cookie does not exist', async () => {
            mockedGetCookie.mockResolvedValue(null);
            await expect(getThreadsCookie()).rejects.toThrow('Access token is required');
        });
    });

    describe('postThreadAction', () => {
        let createThreadTextContainerSpy: jest.SpyInstance;
        let postThreadsTextContainerSpy: jest.SpyInstance;

        beforeEach(() => {
            // Spy on the actual imported functions
            createThreadTextContainerSpy = jest.spyOn(require('../actions'), 'createThreadTextContainer');
            postThreadsTextContainerSpy = jest.spyOn(require('../actions'), 'postThreadsTextContainer');

            createThreadTextContainerSpy.mockResolvedValue('container-456');
            postThreadsTextContainerSpy.mockResolvedValue(true);

            mockedApiClient.post.mockImplementation((url) => {
                if (url === EThreadsAuthEndpoints.NEW_TEXT_CONTAINER) {
                    return Promise.resolve({ data: { id: 'container-456' } });
                }
                if (url === EThreadsAuthEndpoints.POST_TEXT_CONTAINER) {
                    return Promise.resolve({ status: 200 });
                }
                return Promise.reject(new Error('Unknown endpoint'));
            });
        });

        afterEach(() => {
            createThreadTextContainerSpy.mockRestore();
            postThreadsTextContainerSpy.mockRestore();
        });

        it('should post a thread from FormData', async () => {
            const formData = new FormData();
            formData.append('thread_post', 'New thread content');

            mockedGetCookie.mockResolvedValue('access-token-from-cookie');

            // Mock setTimeout to execute immediately
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
            setTimeoutSpy.mockImplementation((callback: (...args: any[]) => void) => {
                callback();
                return 0 as any; // Return a mock timer ID
            });

            await postThreadAction(formData);

            expect(createThreadTextContainerSpy).toHaveBeenCalledWith('New thread content', 'access-token-from-cookie');
            expect(postThreadsTextContainerSpy).toHaveBeenCalledWith('container-456', 'access-token-from-cookie');

            setTimeoutSpy.mockRestore(); // Restore original setTimeout
        });

        it('should throw an error if access token is missing', async () => {
            const formData = new FormData();
            formData.append('thread_post', 'New thread content');
            mockedGetCookie.mockResolvedValue(null);

            await expect(postThreadAction(formData)).rejects.toThrow('Access token is required');
        });
    });
});