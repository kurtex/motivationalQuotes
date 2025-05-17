import ThreadsLogin from "./components/ThreadsLogin";
import { cronjob } from "./lib/utils/cronjob/cronjob";
import HomeAuthenticated from "./components/HomeAuthenticated";
import { getCookie } from "./lib/utils/cookies/actions";

/**
 * This is the main page of the application.
 * It displays a login button if the user is not authenticated,
 * or a message if the user is authenticated.
 */
export default async function Home () {
  cronjob.start();
  const access_token = await getCookie("threads-token");

  return (
    <div className="flex flex-col items-center justify-center h-screen">

      {access_token && (
        <HomeAuthenticated access_token={access_token} />
      )}
      {!access_token && (
        <ThreadsLogin />
      )}
    </div>
  );
}
