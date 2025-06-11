"use client";

import { useState } from 'react';

interface GeminiQuoteGeneratorProps {
    accessToken: string;
}

function GeminiQuoteGenerator ({ accessToken }: GeminiQuoteGeneratorProps) {
    const [quote, setQuote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateQuote = async () => {
        setLoading(true);
        setError('');
        setQuote('');

        try {
            const res = await fetch('/api/gemini-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken }),
            });

            const data = await res.json();
            if (data.quoteText) setQuote(data.quoteText);
            else setError(data.error || 'No quote generated');
        } catch (e) {
            setError('Failed to generate quote');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center flex-col gap-2.5">
            <button
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition"
                onClick={generateQuote}
                disabled={loading}
            >
                {loading ? 'Generating...' : 'Generate Motivational Quote'}
            </button>
            {quote && (
                <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-xl p-4 shadow text-lg max-w-xl text-center">
                    {quote}
                </div>
            )}
            {error && <div className="text-red-500">{error}</div>}
        </div>
    );
}

export default GeminiQuoteGenerator;
