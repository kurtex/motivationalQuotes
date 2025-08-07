"use client";

import { useState, useEffect } from "react";
import { getActivePrompt } from "../lib/database/actions";
import { getThreadsUsername } from "../lib/threads-api/user-data/actions";
import Loader from "./Loader";

/**
 * The props for the HomeAuthenticated component.
 */
interface HomeAuthenticatedProps {
    accessToken: string; // The access token for the authenticated user
}

async function fetchThreadsUsername (accessToken: string): Promise<string> {
    return getThreadsUsername(accessToken);
}

async function savePrompt (prompt: string): Promise<string> {
    const res = await fetch('/api/gemini-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (res.ok) {
        return data.promptText;
    } else {
        throw new Error(data.error || 'Failed to save prompt');
    }
}

async function fetchActivePrompt (accessToken: string): Promise<string | null> {
    return getActivePrompt(accessToken);
}

const HomeAuthenticated: React.FC<HomeAuthenticatedProps> = ({ accessToken }) => {
    const [username, setUsername] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [responseText, setResponseText] = useState("");
    const [responseStatus, setResponseStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activePrompt, setActivePrompt] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchThreadsUsername(accessToken),
            fetchActivePrompt(accessToken),
        ]).then(([username, prompt]) => {
            setUsername(username);
            setActivePrompt(prompt);
        }).catch(() => {
            setUsername("");
            setActivePrompt(null);
        }).finally(() => setLoading(false));

    }, [accessToken]);

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
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 mt-4">Set a New Prompt</h3>
                <form action={async (formData) => {
                    const prompt = formData.get('prompt') as string;
                    if (prompt === activePrompt) {
                        setResponseText("This prompt is already set as active.");
                        setResponseStatus('error');
                        return;
                    }
                    try {
                        const savedPrompt = await savePrompt(prompt);
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
                {activePrompt && (
                    <div className="w-full flex flex-col gap-4 justify-center items-center mt-4">
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch('/api/gemini-generate/preview', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ prompt: activePrompt }),
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        setResponseText(data.quoteText);
                                        setResponseStatus('success');
                                    } else {
                                        throw new Error(data.error || 'Failed to generate preview');
                                    }
                                } catch (error) {
                                    console.error("Error generating preview:", error);
                                    setResponseText((error as Error).message);
                                    setResponseStatus('error');
                                }
                            }}
                            className="bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white font-medium mt-2 border rounded-lg px-4 py-2 transition shadow">
                            Preview Gemini's Response
                        </button>
                    </div>
                )}
                {responseStatus !== 'idle' && (
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mt-4">
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1">Response:</h4>
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
            </div>
        </div>
    );
};

export default HomeAuthenticated;