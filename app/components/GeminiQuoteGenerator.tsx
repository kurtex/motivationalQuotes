'use client';

import { useState, useEffect } from 'react';
import { IScheduledPost } from '../lib/database/models/ScheduledPost';

interface GeminiQuoteGeneratorProps {
    activePrompt: string | null;
}

function GeminiQuoteGenerator ({ activePrompt }: GeminiQuoteGeneratorProps) {
    const [previewResponse, setPreviewResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState('');

    // State for recurring schedule
    const [scheduleType, setScheduleType] = useState<IScheduledPost['scheduleType']>('daily');
    const [intervalValue, setIntervalValue] = useState<number | undefined>(undefined);
    const [intervalUnit, setIntervalUnit] = useState<IScheduledPost['intervalUnit']>(undefined);
    const [timeOfDay, setTimeOfDay] = useState<string>('09:00'); // Default to 9 AM

    // Set default timeOfDay to a reasonable value (e.g., current hour + 1, or 09:00)
    useEffect(() => {
        const now = new Date();
        const hours = (now.getHours() + 1).toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        setTimeOfDay(`${hours}:${minutes}`);
    }, []);

    const handlePreview = async () => {
        if (!activePrompt) {
            setError('Please set an active prompt first.');
            return;
        }
        setLoading(true);
        setError('');
        setPreviewResponse('');

        try {
            const res = await fetch('/api/gemini-generate/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: activePrompt }),
            });

            const data = await res.json();
            if (res.ok && data.quoteText) {
                setPreviewResponse(data.quoteText);
            } else {
                setError(data.error || 'Failed to generate preview.');
            }
        } catch (e) {
            setError('Failed to generate preview.');
        } finally {
            setLoading(false);
        }
    };

    const handlePostImmediately = async () => {
        if (!activePrompt) {
            setPostError('Please set an active prompt first.');
            return;
        }
        setPostLoading(true);
        setPostError('');

        try {
            // Call API to generate from prompt and post immediately
            const res = await fetch('/api/post-now', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: activePrompt }), // Pass activePrompt
            });
            const data = await res.json();
            if (res.ok) {
                setPostError('Response posted successfully!');
            } else {
                setPostError(data.error || 'Failed to post response immediately.');
            }
        } catch (e) {
            setPostError('Failed to post response immediately.');
        }
        finally {
            setPostLoading(false);
        }
    };

    const handleScheduleSending = async () => {
        if (!activePrompt) {
            setPostError('Please set an active prompt first.');
            return;
        }
        if (scheduleType === 'custom' && (!intervalValue || !intervalUnit)) {
            setPostError('Interval value and unit are required for custom schedule.');
            return;
        }
        // Basic time validation: timeOfDay must be valid HH:MM
        if (!/^\d{2}:\d{2}$/.test(timeOfDay)) {
            setPostError('Time of day must be in HH:MM format.');
            return;
        }

        setPostLoading(true);
        setPostError('');

        try {
            const res = await fetch('/api/schedule-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scheduleType,
                    intervalValue: scheduleType === 'custom' ? intervalValue : undefined,
                    intervalUnit: scheduleType === 'custom' ? intervalUnit : undefined,
                    timeOfDay,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setPostError('Schedule updated successfully!');
            } else {
                setPostError(data.error || 'Failed to update schedule.');
            }
        } catch (e) {
            setPostError('Failed to update schedule.');
        }
        finally {
            setPostLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center flex-col gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-md shadow-sm w-full">
            {/* Preview Section */}
            <div className="w-full flex flex-col gap-2">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePreview}
                    disabled={loading || postLoading || !activePrompt}
                >
                    {loading ? 'Generating Preview...' : 'Preview Gemini\'s Response'}
                </button>
                {error && <div className="text-red-500 text-center text-sm">{error}</div>}
                {previewResponse && (
                    <div className="w-full bg-gray-100 dark:bg-gray-800/60 p-3 rounded-md shadow-inner text-center">
                        <p className="text-md font-medium text-gray-800 dark:text-gray-200">"{previewResponse}"</p>
                    </div>
                )}
            </div>

            {/* Immediate Post Section */}
            <div className="w-full flex flex-col gap-2 mt-2">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePostImmediately}
                    disabled={postLoading || loading || !activePrompt}
                >
                    {postLoading ? 'Posting...' : 'Post to Threads Immediately'}
                </button>
            </div>

            {/* Schedule Sending Section */}
            <div className="w-full flex flex-col gap-2 mt-2">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center">Configure Recurring Schedule:</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={scheduleType}
                        onChange={(e) => setScheduleType(e.target.value as IScheduledPost['scheduleType'])}
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        disabled={postLoading}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="custom">Custom</option>
                    </select>

                    {scheduleType === 'custom' && (
                        <>
                            <input
                                type="number"
                                placeholder="Interval"
                                value={intervalValue || ''}
                                onChange={(e) => setIntervalValue(parseInt(e.target.value) || undefined)}
                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                disabled={postLoading}
                                min="1"
                            />
                            <select
                                value={intervalUnit || ''}
                                onChange={(e) => setIntervalUnit(e.target.value as IScheduledPost['intervalUnit'])}
                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                disabled={postLoading}
                            >
                                <option value="">Unit</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                            </select>
                        </>
                    )}
                </div>
                <input
                    type="time"
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    disabled={postLoading}
                />
                <button
                    className="bg-purple-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleScheduleSending}
                    disabled={postLoading || loading || !activePrompt}
                >
                    {postLoading ? 'Saving Schedule...' : 'Save Recurring Schedule'}
                </button>
            </div>

            {postError && <div className="text-red-500 text-center text-sm mt-2">{postError}</div>}
        </div>
    );
}

export default GeminiQuoteGenerator;
