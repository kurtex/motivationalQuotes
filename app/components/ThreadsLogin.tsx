"use client";

import { redirectURI } from "../lib/threads-api/auth-tokens/actions";

const THREADS_OPEN_WINDOW_BASE_URL = "https://www.threads.net";

const ThreadsLogin: React.FC = () => {
	const initThreadsLogin = () => {
		const url = new URL("/oauth/authorize", THREADS_OPEN_WINDOW_BASE_URL);
		url.searchParams.append("client_id", process.env.NEXT_PUBLIC_CLIENT_ID!);
		url.searchParams.append("redirect_uri", redirectURI);
		url.searchParams.append("scope", "threads_basic,threads_content_publish");
		url.searchParams.append("response_type", "code");
		url.searchParams.append("state", process.env.NEXT_PUBLIC_API_STATE!);
		url.searchParams.append("auth_type", "reauthenticate");

		const finalUrl = url.toString() + '#weblink';
		window.location.assign(finalUrl);
	};

	return (
		<div className="flex justify-center items-center h-screen">
			<button className="bg-blue-950 text-white p-2 rounded cursor-pointer hover:bg-blue-800 transition-colors duration-300 font-bold" onClick={initThreadsLogin}>Login to Threads</button>
		</div>
	);
};

export default ThreadsLogin;
