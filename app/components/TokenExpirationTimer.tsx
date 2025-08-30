'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface TokenExpirationTimerProps {
    expiresAt: number; // Unix timestamp in seconds
}

const TokenExpirationTimer: React.FC<TokenExpirationTimerProps> = ({ expiresAt }) => {
    const calculateTimeLeft = useCallback(() => {
        const now = Math.floor(Date.now() / 1000);
        const difference = expiresAt - now;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        }

        const days = Math.floor(difference / (60 * 60 * 24));
        const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((difference % (60 * 60)) / 60);
        const seconds = Math.floor(difference % 60);

        return { days, hours, minutes, seconds, expired: false };
    }, [expiresAt]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    if (timeLeft.expired) {
        return (
            <div className="absolute bottom-4 right-4 text-sm text-red-500 dark:text-red-400">
                Token Expired!
            </div>
        );
    }

    return (
        <div className="absolute bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400">
            Session Expires In: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </div>
    );
};

export default TokenExpirationTimer;
