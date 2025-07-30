"use server";

import {
	getLongLivedToken,
	getShortLivedToken,
} from "@/app/lib/threads-api/auth-tokens/actions";
import { NextResponse } from "next/server";
import {
	saveThreadsToken,
	updateThreadsToken,
} from "@/app/lib/database/actions";
import User from "@/app/lib/database/models/User";
import { connectToDB } from "@/app/lib/database/db";

export async function POST(request: Request) {
	const { code } = await request.json();

	if (!code) {
		return NextResponse.json({ error: "We couldn't retrieve the authentication code" }, { status: 400 });
	}

	try {
		// Get the short-lived token using the code received from the Threads OAuth redirect.
		const shortLiveToken = await getShortLivedToken(code);

		// Get the long-lived token using the short-lived token.
		let longLivedToken;
		try {
			longLivedToken = await getLongLivedToken(shortLiveToken.access_token);
		} catch (error) {
			return NextResponse.json({ error: "There was an error logging in to Threads" }, { status: 500 });
		}

		let token;

		try {
			const metaUserId = shortLiveToken.user_id;

			if (!metaUserId) {
				throw new Error("Meta user ID is required");
			}

			const accessToken = longLivedToken.access_token;

			if (!accessToken) {
				throw new Error("Access token is required");
			}

			const expiresIn = longLivedToken.expires_in;

			if (!expiresIn) {
				throw new Error("Expiration time is required");
			}

			await connectToDB();

			// Check if the user already exists in the database.
			const existingUser = await User.findOne({
				meta_user_id: metaUserId,
			});

			if (existingUser) {
				token = await updateThreadsToken(
					metaUserId,
					longLivedToken.access_token,
					longLivedToken.expires_in
				);
			} else {
				await User.create({
					meta_user_id: metaUserId,
				});

				// Save the long-lived token to the database.
				token = await saveThreadsToken(
					metaUserId,
					longLivedToken.access_token,
					longLivedToken.expires_in
				);
			}
		} catch (error) {
			return NextResponse.json({ error: "There was an error logging in to Threads" }, { status: 500 });
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
			`threads-token=${
				token!.access_token
			}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
				token!.expires_in
			};`
		);

		return response;
	} catch (error) {
		return NextResponse.json({ error: "We couldn't retrieve the token" }, { status: 400 });
	}
}
