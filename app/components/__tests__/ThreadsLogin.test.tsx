import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThreadsLogin from '../ThreadsLogin';
import { redirectURI } from '../../lib/threads-api/auth-tokens/actions';

// Mock the action
jest.mock('../../lib/threads-api/auth-tokens/actions', () => ({
    redirectURI: 'https://mocked-redirect-uri.com/redirect',
}));

describe('ThreadsLogin', () => {
    const originalEnv = process.env;
    const originalOpen = window.open;
    const originalLocation = window.location;
    let assignMock: jest.Mock;

    beforeEach(() => {
        window.open = jest.fn().mockReturnValue({} as Window);
        assignMock = jest.fn();
        // @ts-expect-error allow redefining location for tests
        delete window.location;
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...originalLocation,
                assign: assignMock,
            },
        });
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_CLIENT_ID: 'mock-client-id',
            NEXT_PUBLIC_API_STATE: 'mock-api-state',
        };
    });

    afterEach(() => {
        window.open = originalOpen;
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation,
        });
        process.env = originalEnv;
    });

    it('should render the login button', () => {
        render(<ThreadsLogin />);
        const buttonElement = screen.getByRole('button', { name: /Login to Threads/i });
        expect(buttonElement).toBeInTheDocument();
    });

    it('should open a new window with the Threads OAuth URL when clicked', () => {
        render(<ThreadsLogin />);
        const buttonElement = screen.getByRole('button', { name: /Login to Threads/i });

        fireEvent.click(buttonElement);

        const expectedUrl = new URL('https://www.threads.net/oauth/authorize');
        expectedUrl.searchParams.append('client_id', 'mock-client-id');
        expectedUrl.searchParams.append('redirect_uri', redirectURI);
        expectedUrl.searchParams.append('scope', 'threads_basic,threads_content_publish');
        expectedUrl.searchParams.append('response_type', 'code');
        expectedUrl.searchParams.append('state', 'mock-api-state');
        expectedUrl.searchParams.append('auth_type', 'reauthenticate');

        expect(window.open).toHaveBeenCalledWith(
            expectedUrl.toString(),
            '_blank',
            'noopener,noreferrer'
        );
        expect(assignMock).not.toHaveBeenCalled();
    });

    it('should fall back to window.location.href when window.open is blocked', () => {
        (window.open as jest.Mock).mockReturnValueOnce(null);

        render(<ThreadsLogin />);
        const buttonElement = screen.getByRole('button', { name: /Login to Threads/i });
        fireEvent.click(buttonElement);

        const expectedUrl = new URL('https://www.threads.net/oauth/authorize');
        expectedUrl.searchParams.append('client_id', 'mock-client-id');
        expectedUrl.searchParams.append('redirect_uri', redirectURI);
        expectedUrl.searchParams.append('scope', 'threads_basic,threads_content_publish');
        expectedUrl.searchParams.append('response_type', 'code');
        expectedUrl.searchParams.append('state', 'mock-api-state');
        expectedUrl.searchParams.append('auth_type', 'reauthenticate');

        expect(assignMock).toHaveBeenCalledWith(expectedUrl.toString());
    });
});
