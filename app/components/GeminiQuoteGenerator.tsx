'use client';

import { useState } from 'react';

interface GeminiQuoteGeneratorProps {
    onQuoteGenerated?: (quote: string) => void;
}

function GeminiQuoteGenerator ({ onQuoteGenerated }: GeminiQuoteGeneratorProps) {
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
                body: JSON.stringify({ lastQuote: quote }),
            });

            const data = await res.json();
            if (data.quoteText) {
                setQuote(data.quoteText);
                if (onQuoteGenerated) onQuoteGenerated(data.quoteText);
            } else setError(data.error);
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
            {error && <div className="text-red-500">{error}</div>}
        </div>
    );
}

export default GeminiQuoteGenerator;
