"use server";

import {
	getLongLivedToken,
	getShortLivedToken,
} from "@/app/lib/threads-api/auth-tokens/actions";
import { NextResponse } from "next/server";
import { saveThreadsToken } from "@/app/lib/database/actions";

export async function POST(request: Request) {
	const { code } = await request.json();

	if (!code) {
		return NextResponse.json({
			error: "We couldn't retrieve the authentication code",
			status: 400,
		});
	}

	try {
		// Get the short-lived token using the code received from the Threads OAuth redirect.
		const shortLiveToken = await getShortLivedToken(code);

		// Get the long-lived token using the short-lived token.
		const longLivedToken = await getLongLivedToken(shortLiveToken.access_token);

		let token;

		try {
			// Save the long-lived token to the database.
			token = await saveThreadsToken(
				shortLiveToken.user_id,
				longLivedToken.access_token,
				longLivedToken.expires_in
			);
		} catch (error) {
			return NextResponse.json({
				error: "There was an error logging in to Threads",
				status: 500,
			});
		}

		const response = NextResponse.json({
			message: "Logged in to Threads",
			status: 200,
		});

		// Create a cookie with the short-lived token using NextJS cookies.
		// await createCookie({
		// 	name: "threads-token",
		// 	value: shortLiveToken.access_token,
		// 	httpOnly: true,
		// 	secure: true,
		// 	path: "/",
		// });

		// Set the cookie in the response headers.
		// Note: The cookie is set to expire after 60 days.
		response.headers.append(
			"Set-Cookie",
			`threads-token=${token.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${token.expires_in};`
		);

		return response;
	} catch (error) {
		return NextResponse.json({
			error: "We couldn't retrieve the token",
			status: 400,
		});
	}
}
