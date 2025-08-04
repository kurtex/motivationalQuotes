import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomeAuthenticated from '../HomeAuthenticated';
import { getThreadsUsername } from '../../lib/threads-api/user-data/actions';
import { postThreadAction } from '../../lib/threads-api/threads-posts/actions';

// Mock child component
jest.mock('../GeminiQuoteGenerator', () => {
    return jest.fn(({ onQuoteGenerated }) => (
        <button onClick={() => onQuoteGenerated('mock quote from child')}>
            Generate Motivational Quote
        </button>
    ));
});

// Mock actions
jest.mock('../../lib/threads-api/user-data/actions', () => ({
    getThreadsUsername: jest.fn(),
}));
jest.mock('../../lib/threads-api/threads-posts/actions', () => ({
    postThreadAction: jest.fn(),
}));

describe('HomeAuthenticated', () => {
    const mockAccessToken = 'mock-access-token';

    beforeEach(() => {
        (getThreadsUsername as jest.Mock).mockClear();
        (postThreadAction as jest.Mock).mockClear();
    });

    it('should show loader and not the main content while fetching username', () => {
        (getThreadsUsername as jest.Mock).mockReturnValue(new Promise(() => { })); // Never resolves
        render(<HomeAuthenticated accessToken={mockAccessToken} />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
        expect(screen.queryByText(/Hello/)).not.toBeInTheDocument();
    });

    it('should display username on successful fetch', async () => {
        const mockUsername = 'testuser';
        (getThreadsUsername as jest.Mock).mockResolvedValue(mockUsername);
        render(<HomeAuthenticated accessToken={mockAccessToken} />);
        await waitFor(() => {
            expect(screen.getByText(`Hello ${mockUsername}!`)).toBeInTheDocument();
        });
    });

    it('should handle username fetch error', async () => {
        (getThreadsUsername as jest.Mock).mockRejectedValue(new Error('Fetch error'));
        render(<HomeAuthenticated accessToken={mockAccessToken} />);
        await waitFor(() => {
            expect(screen.getByText('Hello !')).toBeInTheDocument();
        });
    });

    it('should update textarea when a quote is generated', async () => {
        (getThreadsUsername as jest.Mock).mockResolvedValue('testuser');
        render(<HomeAuthenticated accessToken={mockAccessToken} />);

        await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

        const generateButton = screen.getByRole('button', { name: /Generate Motivational Quote/i });
        fireEvent.click(generateButton);

        await waitFor(() => {
            const textarea = screen.getByPlaceholderText('What are you thinking?') as HTMLTextAreaElement;
            expect(textarea.value).toBe('mock quote from child');
        });
    });

    it('should call postThreadAction on form submission and clear textarea', async () => {
        (getThreadsUsername as jest.Mock).mockResolvedValue('testuser');
        (postThreadAction as jest.Mock).mockResolvedValue(null);
        render(<HomeAuthenticated accessToken={mockAccessToken} />);

        await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

        const textarea = screen.getByPlaceholderText('What are you thinking?') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: 'My new thread' } });
        expect(textarea.value).toBe('My new thread');

        const submitButton = screen.getByRole('button', { name: /Post Thread/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(postThreadAction).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(textarea.value).toBe('');
        });
    });
});