import ThreadsLogin from "./components/ThreadsLogin";
import HomeAuthenticated from "./components/HomeAuthenticated";
import { getCookie } from "./lib/utils/cookies/actions";
import { connectToDB } from "./lib/database/db";


import { getTokenExpiration } from "./lib/database/actions";

/**
 * This is the main page of the application.
 * It displays a login button if the user is not authenticated,
 * or a message if the user is authenticated.
 */
export default async function Home () {
  await connectToDB();
  const access_token = await getCookie("threads-token");
  const tokenExpiration = access_token ? await getTokenExpiration(access_token) : null;

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      {access_token && tokenExpiration && (
        <>
          <HomeAuthenticated accessToken={access_token} tokenExpiration={tokenExpiration} />
        </>
      )}
      {!access_token && (
        <ThreadsLogin />
      )}
    </div>
  );
}
