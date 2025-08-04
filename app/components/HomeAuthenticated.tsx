"use client";

import { useState, useRef, useEffect } from "react";
import GeminiQuoteGenerator from "./GeminiQuoteGenerator";
import { postThreadAction } from '../lib/threads-api/threads-posts/actions';
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

const HomeAuthenticated: React.FC<HomeAuthenticatedProps> = ({ accessToken }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [quote, setQuote] = useState("");
    const [username, setUsername] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Handler to receive quote from GeminiQuoteGenerator
    const handleQuoteGenerated = (newQuote: string) => {
        setQuote(newQuote);
        if (textareaRef.current) {
            textareaRef.current.value = newQuote;
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchThreadsUsername(accessToken)
            .then(setUsername)
            .catch(() => setUsername(""))
            .finally(() => setLoading(false));

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
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Write a Thread</h3>
                <GeminiQuoteGenerator onQuoteGenerated={handleQuoteGenerated} />
                <form action={async (formData) => {
                    await postThreadAction(formData);
                    setQuote("");
                    if (textareaRef.current) textareaRef.current.value = "";
                }} className='w-full flex flex-col gap-3'>
                    <textarea
                        ref={textareaRef}
                        placeholder="What are you thinking?"
                        name="thread_post"
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900'
                        rows={4}
                        defaultValue={quote}
                    />
                    <div className="flex flex-row gap-4 justify-center items-center">
                        <button
                            type="submit"
                            className="bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white font-medium mt-2 border rounded-lg px-4 py-2 transition shadow">
                            Post Thread
                        </button>
                    </div>
                </form>
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