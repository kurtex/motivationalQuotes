import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThreadsLogin from '../ThreadsLogin';
import { redirectURI } from '../../lib/threads-api/auth-tokens/actions';

// Mock the action
jest.mock('../../lib/threads-api/auth-tokens/actions', () => ({
    redirectURI: 'https://mocked-redirect-uri.com/redirect',
}));

describe('ThreadsLogin', () => {
    const originalOpen = window.open;
    const originalEnv = process.env;

    beforeEach(() => {
        // Mock window.open
        window.open = jest.fn();
        // Set up environment variables
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_CLIENT_ID: 'mock-client-id',
            NEXT_PUBLIC_API_STATE: 'mock-api-state',
        };
    });

    afterEach(() => {
        // Restore original window.open and process.env
        window.open = originalOpen;
        process.env = originalEnv;
    });

    it('should render the login button', () => {
        render(<ThreadsLogin />);
        const buttonElement = screen.getByRole('button', { name: /Login to Threads/i });
        expect(buttonElement).toBeInTheDocument();
    });

    it('should call window.open with the correct URL when the button is clicked', () => {
        render(<ThreadsLogin />);
        const buttonElement = screen.getByRole('button', { name: /Login to Threads/i });

        fireEvent.click(buttonElement);

        const expectedUrl = new URL('https://www.threads.net/oauth/authorize');
        expectedUrl.searchParams.append('client_id', 'mock-client-id');
        expectedUrl.searchParams.append('redirect_uri', redirectURI);
        expectedUrl.searchParams.append('scope', 'threads_basic,threads_content_publish');
        expectedUrl.searchParams.append('response_type', 'code');
        expectedUrl.searchParams.append('state', 'mock-api-state');

        expect(window.open).toHaveBeenCalledWith(expectedUrl, '_system');
    });
});
