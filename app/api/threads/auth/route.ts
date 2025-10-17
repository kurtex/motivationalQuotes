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
import { threadsAuthSchema } from "./schema";

export async function POST(request: Request) {
	const body = await request.json();
	const validation = threadsAuthSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ error: "Invalid request data", issues: validation.error.flatten() },
			{ status: 400 }
		);
	}
	const { code } = validation.data;

	let shortLivedToken;
	try {
		// Step 1: Exchange authorization code for a short-lived token.
		// A failure here is a client-side error (invalid code).
		shortLivedToken = await getShortLivedToken(code);
		if (!shortLivedToken?.access_token) {
			throw new Error("Failed to retrieve short-lived token.");
		}
	} catch (error) {
		console.error("Threads auth error (short-lived token):", error);
		return NextResponse.json(
			{ error: "We couldn't retrieve the token" },
			{ status: 400 }
		);
	}

	try {
		// Step 2: Exchange short-lived token for a long-lived token.
		// A failure from this point on is a server-side or Meta-side issue.
		const longLivedToken = await getLongLivedToken(
			shortLivedToken.access_token
		);

		const { user_id: metaUserId } = shortLivedToken;
		const { access_token: accessToken, expires_in: expiresIn } = longLivedToken;

		if (!metaUserId || !accessToken || !expiresIn) {
			throw new Error("Invalid token data received from Meta.");
		}

		await connectToDB();

		const existingUser = await User.findOne({ meta_user_id: metaUserId });

		if (existingUser) {
			await updateThreadsToken(metaUserId.toString(), accessToken, expiresIn);
		} else {
			await User.create({
				meta_user_id: metaUserId,
			});
			await saveThreadsToken(metaUserId.toString(), accessToken, expiresIn);
		}

		const response = NextResponse.json({
			message: "Logged in to Threads",
		});

		response.cookies.set({
			name: "threads-token",
			value: accessToken,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: expiresIn,
		});

		return response;
	} catch (error) {
		console.error("Threads auth error (long-lived token or DB):", error);
		return NextResponse.json(
			{ error: "There was an error logging in to Threads" },
			{ status: 500 }
		);
	}
}