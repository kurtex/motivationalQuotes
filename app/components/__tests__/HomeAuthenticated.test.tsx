import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomeAuthenticated from '../HomeAuthenticated';
import { getThreadsUsername } from '../../lib/threads-api/user-data/actions';
import { getActivePrompt } from '../../lib/database/actions';

// Mock actions
jest.mock('../../lib/threads-api/user-data/actions');
jest.mock('../../lib/database/actions');

// Mock the global fetch function
global.fetch = jest.fn();

const mockFetch = fetch as jest.Mock;
const mockGetThreadsUsername = getThreadsUsername as jest.Mock;
const mockGetActivePrompt = getActivePrompt as jest.Mock;

describe('HomeAuthenticated', () => {
    const mockAccessToken = 'mock-access-token';

    beforeEach(() => {
        mockGetThreadsUsername.mockClear();
        mockGetActivePrompt.mockClear();
        mockFetch.mockClear();
        // Mock console.error to avoid polluting the test output
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        (console.error as jest.Mock).mockRestore();
    });

    it('should display the active prompt on load', async () => {
        mockGetThreadsUsername.mockResolvedValue('testuser');
        mockGetActivePrompt.mockResolvedValue('My active prompt');

        render(<HomeAuthenticated accessToken={mockAccessToken} />);

        // Wait for loader to disappear and content to be present
        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });
        expect(screen.getByText('My active prompt')).toBeInTheDocument();
    });

    it('should save a new prompt and update the UI', async () => {
        mockGetThreadsUsername.mockResolvedValue('testuser');
        mockGetActivePrompt.mockResolvedValue(null); // No initial active prompt
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ promptText: 'New saved prompt' }),
        });

        render(<HomeAuthenticated accessToken={mockAccessToken} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        const textarea = screen.getByPlaceholderText('Enter your new prompt here...');
        fireEvent.change(textarea, { target: { value: 'New saved prompt' } });

        const saveButton = screen.getByRole('button', { name: /Save and Set as Active Prompt/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            // Check for the success message and icon
            expect(screen.getByText('Prompt saved successfully!')).toBeInTheDocument();
            expect(screen.getByText('✅')).toBeInTheDocument();
            // Check that the active prompt has been updated in the UI
            expect(screen.getByText('New saved prompt')).toBeInTheDocument();
        });
    });

    it('should show a warning for duplicate prompts', async () => {
        mockGetThreadsUsername.mockResolvedValue('testuser');
        mockGetActivePrompt.mockResolvedValue('Duplicate prompt');

        render(<HomeAuthenticated accessToken={mockAccessToken} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        const textarea = screen.getByPlaceholderText('Enter your new prompt here...');
        fireEvent.change(textarea, { target: { value: 'Duplicate prompt' } });

        const saveButton = screen.getByRole('button', { name: /Save and Set as Active Prompt/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('This prompt is already set as active.')).toBeInTheDocument();
            expect(screen.getByText('❌')).toBeInTheDocument();
        });
    });

    it('should generate a preview', async () => {
        mockGetThreadsUsername.mockResolvedValue('testuser');
        mockGetActivePrompt.mockResolvedValue('Active prompt for preview');
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ quoteText: 'Generated preview text' }),
        });

        render(<HomeAuthenticated accessToken={mockAccessToken} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        const previewButton = screen.getByRole('button', { name: /Preview Gemini's Response/i });
        fireEvent.click(previewButton);

        await waitFor(() => {
            expect(screen.getByText('Generated preview text')).toBeInTheDocument();
            expect(screen.getByText('✅')).toBeInTheDocument();
        });
    });
});
