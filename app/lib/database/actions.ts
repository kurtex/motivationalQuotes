"use server";

import { connectToDB } from "./db";

import User from "./models/User";
import Quote from "./models/Quote";
import Token, { IToken } from "./models/Token";

/**
 * Saves a Threads token to the database.
 *
 * @param metaUserId - The user ID from the meta database.
 * @param accessToken - The access token for the Threads API.
 * @param expiresIn - The expiration time of the token in seconds.
 * @returns The saved token.
 */
export async function saveThreadsToken(
	metaUserId: string,
	accessToken: string,
	expiresIn: number
): Promise<IToken> {
	await connectToDB();
	const now = Math.floor(Date.now() / 1000);

	const token: IToken = await saveToken(
		metaUserId,
		accessToken,
		now,
		expiresIn
	);

	return token!;
}

export async function updateThreadsToken(
	metaUserId: string,
	accessToken: string,
	expiresIn: number
): Promise<IToken> {
	await connectToDB();
	const now = Math.floor(Date.now() / 1000);

	const token: IToken | null = await Token.findOneAndUpdate(
		{ user_id: metaUserId },
		{
			access_token: accessToken,
			last_updated: now,
			expires_in: expiresIn,
		},
		{ new: true } // This option ensures the updated document is returned
	);

	return token!;
}

/**
 * Creates a Threads token in the database.
 *
 * @param token
 * @param metaUserId
 * @param accessToken
 * @param now
 * @param expiresIn
 * @returns
 */
async function saveToken(
	metaUserId: string,
	accessToken: string,
	now: number,
	expiresIn: number
): Promise<IToken> {
	const token = await Token.create({
		user_id: metaUserId,
		access_token: accessToken,
		last_updated: now,
		expires_in: expiresIn,
	}).catch((err) => {
		throw new Error("Error creating token: " + err);
	});
	return token;
}

/**
 * Retrieves the Threads user ID associated with a given access token.
 *
 * @param accessToken - The access token for the Threads API.
 * @returns The Threads user ID or null if not found.
 * @throws An error if the token or user is not found.
 */
export async function getMetaUserIdByThreadsAccessToken(
	accessToken: string
): Promise<string> {
	await connectToDB();

	const token = await Token.findOne({ access_token: accessToken });

	if (!token) {
		throw new Error("Token not found");
	}

	return token.user_id;
}

/**
 * Save a generated quote to the database and associate it with a user.
 * @param text The quote text
 * @param accessToken The user's Threads access token
 * @returns The saved quote document
 */
export async function saveGeminiQuote(text: string, accessToken: string) {
	// Find user by access token
	const metaUserId = await getMetaUserIdByThreadsAccessToken(accessToken);
	await connectToDB();
	const user = await User.findOne({ meta_user_id: metaUserId });
	if (!user) throw new Error("User not found");
	// Save quote
	const quote = await Quote.create({ text, user: user._id });
	return quote;
}
