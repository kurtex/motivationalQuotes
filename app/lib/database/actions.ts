"use server";

import { Types } from "mongoose";
import { connectToDB } from "./db";
import TokenModel, { IToken } from "./models/Token";
import User from "./models/User";

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
	if (!metaUserId) {
		throw new Error("Meta user ID is required");
	}
	if (!accessToken) {
		throw new Error("Access token is required");
	}
	if (!expiresIn) {
		throw new Error("Expiration time is required");
	}

	await connectToDB();
	const now = Math.floor(Date.now() / 1000);

	const user = await User.findOne({ meta_id: metaUserId });
	let token: IToken | null = null;

	if (user) {
		token = await TokenModel.findOne({ user_id: user.meta_id });

		if (!token) {
			return await createThreadsToken(
				user.meta_id,
				accessToken,
				now,
				expiresIn
			);
		}

		token = await TokenModel.findOneAndUpdate(
			{ user_id: user.meta_id },
			{
				access_token: accessToken,
				last_updated: now,
				expires_in: expiresIn,
			},
			{ new: true } // This option ensures the updated document is returned
		);
	} else {
		await User.create({
			user_id: new Types.ObjectId(),
			meta_id: metaUserId,
		});

		token = await createThreadsToken(metaUserId, accessToken, now, expiresIn);
	}

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
async function createThreadsToken(
	metaUserId: string,
	accessToken: string,
	now: number,
	expiresIn: number
): Promise<IToken> {
	const token = await TokenModel.create({
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

	const token = await TokenModel.findOne({ access_token: accessToken });

	if (!token) {
		throw new Error("Token not found");
	}

	return token.user_id;
}
