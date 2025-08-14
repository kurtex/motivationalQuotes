"use client";
/** @jsxImportSource react */

import { useState, useEffect } from "react";
import { getActivePrompt, getScheduledPostForUser, savePrompt } from "../lib/database/actions";
import { getThreadsUsername } from "../lib/threads-api/user-data/actions";
import TokenExpirationTimer from "./TokenExpirationTimer";
import Loader from "./Loader";
import GeminiQuoteGenerator from "./GeminiQuoteGenerator";
import { IScheduledPost } from "../lib/database/models/ScheduledPost";

/**
 * The props for the HomeAuthenticated component.
 */
interface HomeAuthenticatedProps {
    accessToken: string;
    tokenExpiration: number;
}

async function fetchThreadsUsername (accessToken: string): Promise<string> {
    return getThreadsUsername(accessToken);
}

async function fetchActivePrompt (accessToken: string): Promise<string | null> {
    return getActivePrompt(accessToken);
}

async function fetchScheduledPost (accessToken: string): Promise<IScheduledPost | null> {
    return getScheduledPostForUser(accessToken);
}

const HomeAuthenticated: React.FC<HomeAuthenticatedProps> = ({ accessToken, tokenExpiration }) => {
    const [username, setUsername] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [responseText, setResponseText] = useState("");
    const [responseStatus, setResponseStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [scheduledPost, setScheduledPost] = useState<IScheduledPost | null>(null);
    const [clearLoading, setClearLoading] = useState(false);
    const [clearError, setClearError] = useState('');
    const [loggingOut, setLoggingOut] = useState(false); // New state for logout loading

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchThreadsUsername(accessToken),
            fetchActivePrompt(accessToken),
            fetchScheduledPost(accessToken),
        ]).then(([username, prompt, schedule]) => {
            setUsername(username);
            setActivePrompt(prompt);
            setScheduledPost(schedule);
            console.log("Fetched data successfully:", { username, prompt, schedule });
        }).catch(err => {
            console.error("Error fetching initial data:", err);
            setUsername("");
            setActivePrompt(null);
            setScheduledPost(null);
        }).finally(() => setLoading(false));

    }, [accessToken]);

    const handleClearSchedule = async () => {
        setClearLoading(true);
        setClearError('');
        try {
            const res = await fetch('/api/clear-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (res.ok) {
                setScheduledPost(null); // Clear the schedule from state
                setClearError('Schedule cleared successfully!');
            } else {
                setClearError(data.error || 'Failed to clear schedule.');
            }
        } catch (e) {
            setClearError('Failed to clear schedule.');
        } finally {
            setClearLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
            });
            if (res.ok) {
                // Redirect to home page or login page after successful logout
                window.location.href = '/';
            } else {
                console.error("Logout failed:", await res.json());
                setLoggingOut(false); // Reset loading state on error
            }
        } catch (error) {
            console.error("Error during logout:", error);
            setLoggingOut(false); // Reset loading state on error
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
                <Loader />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 shadow-lg mt-2 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl flex flex-col gap-6 justify-center items-center w-full max-w-4xl">
            <span className='border-2 border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full px-8 py-4 m-2 text-2xl font-semibold shadow'>
                {`Hello ${username}!`}
            </span>
            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-4 justify-center items-center shadow-inner">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Your Active Prompt</h3>
                {activePrompt ? (
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                        <p className="text-gray-900 dark:text-gray-100">{activePrompt}</p>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">You don't have an active prompt yet.</p>
                )}

                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 mt-4">Current Posting Schedule</h3>
                {scheduledPost ? (
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex flex-col gap-2">
                        <p className="text-gray-900 dark:text-gray-100">
                            <strong>Type:</strong> {scheduledPost.scheduleType.charAt(0).toUpperCase() + scheduledPost.scheduleType.slice(1)}
                        </p>
                        {scheduledPost.scheduleType === 'custom' && (
                            <p className="text-gray-900 dark:text-gray-100">
                                <strong>Interval:</strong> Every {scheduledPost.intervalValue} {scheduledPost.intervalUnit}
                            </p>
                        )}
                        <p className="text-gray-900 dark:text-gray-100">
                            <strong>Time of Day:</strong> {scheduledPost.timeOfDay}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">
                            <strong>Next Post:</strong> {new Date(scheduledPost.nextScheduledAt).toLocaleString()}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">
                            <strong>Status:</strong> {scheduledPost.status.charAt(0).toUpperCase() + scheduledPost.status.slice(1)}
                        </p>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            onClick={handleClearSchedule}
                            disabled={clearLoading}
                        >
                            {clearLoading ? 'Clearing...' : 'Clear Schedule'}
                        </button>
                        {clearError && <div className="text-red-500 text-center mt-2">{clearError}</div>}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No recurring post schedule set.</p>
                )}

                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 mt-4">Set a New Prompt</h3>
                <form action={async (formData) => {
                    const prompt = formData.get('prompt') as string;
                    if (prompt === activePrompt) {
                        setResponseText("This prompt is already set as active.");
                        setResponseStatus('error');
                        return;
                    }
                    try {
                        const savedPrompt = await savePrompt(prompt, accessToken);
                        setActivePrompt(savedPrompt);
                        setResponseText("Prompt saved successfully!");
                        setResponseStatus('success');
                    } catch (error) {
                        console.error("Error saving prompt:", error);
                        setResponseText((error as Error).message);
                        setResponseStatus('error');
                    }
                }} className='w-full flex flex-col gap-3'>
                    <textarea
                        placeholder="Enter your new prompt here..."
                        name="prompt"
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900'
                        rows={4}
                        onChange={() => setResponseStatus('idle')}
                    />
                    <div className="flex flex-row gap-4 justify-center items-center">
                        <button
                            type="submit"
                            className="bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white font-medium mt-2 border rounded-lg px-4 py-2 transition shadow">
                            Save and Set as Active Prompt
                        </button>
                    </div>
                </form>

                <div className="w-full flex flex-col gap-4 justify-center items-center mt-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Actions for Active Prompt</h3>
                    <GeminiQuoteGenerator activePrompt={activePrompt} />
                </div>

                {responseStatus !== 'idle' && (
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mt-4">
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Response:</h4>
                        <div className="flex items-center">
                            {responseStatus === 'success' && <span className="text-2xl mr-2">✅</span>}
                            {responseStatus === 'error' && <span className="text-2xl mr-2">❌</span>}
                            <p className="text-gray-900 dark:text-gray-100">{responseText}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full flex justify-end mt-4">
                <a href="/threads/delete" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
                    Data Deletion Instructions
                </a>
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="ml-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
            </div>
            <TokenExpirationTimer expiresAt={tokenExpiration} />
        </div>
    );
};

export default HomeAuthenticated;