import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomeAuthenticated from '../HomeAuthenticated';
import { getThreadsUsername } from '../../lib/threads-api/user-data/actions';
import { getActivePrompt } from '../../lib/database/actions';

// Mock actions
jest.mock('../../lib/threads-api/user-data/actions');
jest.mock('../../lib/database/actions');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
  })),
  // Also mock the top-level post and get if they are used directly
  post: jest.fn(),
  get: jest.fn(),
}));

// Mock the global fetch function
global.fetch = jest.fn();

const mockFetch = fetch as jest.Mock;
const mockGetThreadsUsername = getThreadsUsername as jest.Mock;
const mockGetActivePrompt = getActivePrompt as jest.Mock;

describe('HomeAuthenticated', () => {
    const mockAccessToken = 'mock-access-token';

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock console.error to avoid polluting the test output
        jest.spyOn(console, 'error').mockImplementation(() => { });
        mockGetThreadsUsername.mockResolvedValue('testuser');
        mockGetActivePrompt.mockResolvedValue('My active prompt');
        // Mock fetchScheduledPost to resolve immediately
        jest.mock('../../lib/database/actions', () => ({
            ...jest.requireActual('../../lib/database/actions'), // Keep actual implementations for other actions
            getScheduledPostForUser: jest.fn().mockResolvedValue(null),
        }));
    });

    afterEach(() => {
        (console.error as jest.Mock).mockRestore();
    });

    it('should render without crashing and display username', async () => {
        render(<HomeAuthenticated accessToken={mockAccessToken} tokenExpiration={Date.now() + 3600000} />);

        await waitFor(() => {
            expect(screen.getByText(/Hello testuser!/i)).toBeInTheDocument();
        });
    });

    it('should handle logout successfully', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        // Mock window.location.href
        const { location } = window;
        delete window.location;
        window.location = { ...location, href: '' } as Location;

        render(<HomeAuthenticated accessToken={mockAccessToken} tokenExpiration={Date.now() + 3600000} />);

        await waitFor(() => {
            expect(screen.getByText(/Hello testuser!/i)).toBeInTheDocument();
        });

        const logoutButton = screen.getByRole('button', { name: /Logout/i });
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
            expect(window.location.href).toBe('/');
        });

        // Restore window.location
        window.location = location;
    });
});
