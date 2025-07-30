import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeminiQuoteGenerator from '../GeminiQuoteGenerator';

// Mock fetch
global.fetch = jest.fn();

describe('GeminiQuoteGenerator', () => {
    const mockOnQuoteGenerated = jest.fn();

    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
        mockOnQuoteGenerated.mockClear();
    });

    it('should render the generate button', () => {
        render(<GeminiQuoteGenerator />);
        const buttonElement = screen.getByRole('button', { name: /Generate Motivational Quote/i });
        expect(buttonElement).toBeInTheDocument();
    });

    it('should show loading state when generating a quote', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        render(<GeminiQuoteGenerator />);
        const buttonElement = screen.getByRole('button', { name: /Generate Motivational Quote/i });

        act(() => {
            fireEvent.click(buttonElement);
        });

        expect(screen.getByRole('button', { name: /Generating.../i })).toBeInTheDocument();
        expect(buttonElement).toBeDisabled();

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /Generating.../i })).not.toBeInTheDocument();
        });
    });

    it('should generate a quote and call onQuoteGenerated on success', async () => {
        const mockQuote = 'This is a new quote.';
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ quoteText: mockQuote }),
        });

        render(<GeminiQuoteGenerator onQuoteGenerated={mockOnQuoteGenerated} />);
        const buttonElement = screen.getByRole('button', { name: /Generate Motivational Quote/i });

        await act(async () => {
            fireEvent.click(buttonElement);
        });

        await waitFor(() => {
            expect(mockOnQuoteGenerated).toHaveBeenCalledWith(mockQuote);
        });
    });

    it('should show an error message from the server', async () => {
        const errorMessage = 'Server error';
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ error: errorMessage }),
        });

        render(<GeminiQuoteGenerator />);
        const buttonElement = screen.getByRole('button', { name: /Generate Motivational Quote/i });

        await act(async () => {
            fireEvent.click(buttonElement);
        });

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('should show a generic error message on network failure', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<GeminiQuoteGenerator />);
        const buttonElement = screen.getByRole('button', { name: /Generate Motivational Quote/i });

        await act(async () => {
            fireEvent.click(buttonElement);
        });

        await waitFor(() => {
            expect(screen.getByText('Failed to generate quote')).toBeInTheDocument();
        });
    });
});