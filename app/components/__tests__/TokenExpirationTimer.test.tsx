import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TokenExpirationTimer from '../TokenExpirationTimer';

describe('TokenExpirationTimer', () => {
    const MOCK_CURRENT_TIME = new Date('2025-01-01T12:00:00Z').getTime();

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(MOCK_CURRENT_TIME);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should display the correct remaining time', () => {
        const expiresAt = MOCK_CURRENT_TIME / 1000 + 3600 + 120; // 1 hour and 2 minutes from now in seconds

        render(<TokenExpirationTimer expiresAt={expiresAt} />);

        // Advance timers by a small amount to trigger useEffect and initial render
        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(screen.getByText(/Session Expires In:/)).toBeInTheDocument();
        expect(screen.getByText(/1h 2m 0s/)).toBeInTheDocument();
    });

    it('should update the remaining time every second', () => {
        const expiresAt = MOCK_CURRENT_TIME / 1000 + 5; // 5 seconds from now

        render(<TokenExpirationTimer expiresAt={expiresAt} />);

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByText(/4s/)).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByText(/3s/)).toBeInTheDocument();
    });

    it('should display 0s when the token has expired', () => {
        const expiresAt = MOCK_CURRENT_TIME / 1000 - 10; // 10 seconds ago

        render(<TokenExpirationTimer expiresAt={expiresAt} />);

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(screen.getByText(/Token Expired!/)).toBeInTheDocument();
    });
});
