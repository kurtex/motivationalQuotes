import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetaRedirection from '../MetaRedirection';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MetaRedirection', () => {
    const mockPush = jest.fn();
    const originalEnv = process.env;

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        mockedAxios.post.mockClear();
        mockPush.mockClear();
        jest.spyOn(console, 'error').mockImplementation(() => { });
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_API_STATE: 'test-state',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    it('should redirect to / if code and state are not present', () => {
        (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
        render(<MetaRedirection />);
        expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should redirect to /error if state is invalid', () => {
        const params = new URLSearchParams();
        params.set('code', 'some-code');
        params.set('state', 'invalid-state');
        (useSearchParams as jest.Mock).mockReturnValue(params);
        render(<MetaRedirection />);
        expect(mockPush).toHaveBeenCalledWith('/error');
    });

    it('should redirect to / on successful auth', async () => {
        const params = new URLSearchParams();
        params.set('code', 'some-code');
        params.set('state', process.env.NEXT_PUBLIC_API_STATE || '');
        (useSearchParams as jest.Mock).mockReturnValue(params);
        mockedAxios.post.mockResolvedValue({
            data: {},
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { url: '/api/threads/auth' },
        });

        render(<MetaRedirection />);

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/threads/auth', { code: 'some-code' });
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    it('should redirect to /error on failed auth', async () => {
        const params = new URLSearchParams();
        params.set('code', 'some-code');
        params.set('state', process.env.NEXT_PUBLIC_API_STATE || '');
        (useSearchParams as jest.Mock).mockReturnValue(params);
        mockedAxios.post.mockRejectedValue(new Error('Auth failed'));

        render(<MetaRedirection />);

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/threads/auth', { code: 'some-code' });
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/error');
        });
    });

    it('should show loader while processing', () => {
        const params = new URLSearchParams();
        params.set('code', 'some-code');
        params.set('state', process.env.NEXT_PUBLIC_API_STATE || '');
        (useSearchParams as jest.Mock).mockReturnValue(params);
        mockedAxios.post.mockResolvedValue({
            data: {},
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { url: '/api/threads/auth' },
        });

        const { container } = render(<MetaRedirection />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
    });
});
