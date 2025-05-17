import { getThreadsUsername } from '../lib/threads-api/user-data/actions';
import { createThreadTextContainer, postThreadsTextContainer } from '../lib/threads-api/threads-posts/actions';
import { connectToDB } from '../lib/database/db';
import { getMetaUserIdByThreadsAccessToken } from '../lib/database/actions';
import { getCookie } from '../lib/utils/cookies/actions';

/**
 * The props for the HomeAuthenticated component.
 */
interface HomeAuthenticatedProps {
    access_token: string; // The access token for the authenticated user
}

const HomeAuthenticated: React.FC<HomeAuthenticatedProps> = async ({ access_token }) => {
    const username = await getThreadsUsername(access_token);

    // Server Action for posting a thread
    async function postThreadAction (formData: FormData) {
        "use server";

        const content = formData.get('thread_post') as string;

        connectToDB();
        try {
            const access_token = await getCookie("threads-token");

            if (!access_token) {
                throw new Error("Access token is required");
            }

            const threadsContainerId = await createThreadTextContainer(content, access_token);
            await new Promise(resolve => setTimeout(resolve, 3000));
            await postThreadsTextContainer(threadsContainerId, access_token);
        } catch (error) {
            console.error("Error creating thread post:", error);
            throw error;
        }
    }

    return (
        <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
            <div className="bg-white dark:bg-gray-900 shadow-lg mt-2 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl flex flex-col gap-6 justify-center items-center w-full max-w-4xl">
                <span className='border-2 border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full px-8 py-4 m-2 text-2xl font-semibold shadow'>
                    Hello {username}!
                </span>
                <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-4 justify-center items-center shadow-inner">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Write a Thread</h3>
                    <form action={postThreadAction} className='w-full flex flex-col gap-3'>
                        <textarea
                            placeholder="What are you thinking?"
                            name="thread_post"
                            className='w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900'
                            rows={4}
                        />
                        <div className="flex flex-row gap-4 justify-center items-center">
                            <button
                                type="submit"
                                className="bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 
                                dark:hover:bg-blue-800 text-white font-medium mt-2 
                                border rounded-lg px-4 py-2 transition shadow">
                                Post Thread
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HomeAuthenticated;