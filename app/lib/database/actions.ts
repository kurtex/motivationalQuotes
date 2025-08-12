"use server";

import { connectToDB } from "./db";
import Quote, { IQuote } from "./models/Quote";
import Token, { IToken } from "./models/Token";
import User from "./models/User";
import crypto from "crypto";
import Prompt from "./models/Prompt";
import { GeminiClient } from "../ai/geminiClient";
import { GeminiModel } from "../ai/geminiModels";

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
 * Save a generated quote to the database and associate it with a user.
 * @param text The quote text
 * @param threadsAccessToken The user's Threads access token
 * @returns The saved quote document
 */
export async function saveGeminiQuote(
	text: string,
	threadsAccessToken: string,
	promptId?: string
): Promise<string> {
	// Find user by access token
	const metaUserId = await getMetaUserIdByThreadsAccessToken(
		threadsAccessToken
	);

	const user = await User.findOne({ meta_user_id: metaUserId });
	if (!user) throw new Error("User not found");

	// Hash deduplication
	const hash = crypto.createHash("sha256").update(text).digest("hex");
	const existing = await Quote.findOne({ hash, user: user._id });
	if (existing) throw new Error("Duplicate quote detected (hash)");

	// Embedding deduplication using Gemini embedding model
	const geminiEmbeddingClient = new GeminiClient(
		GeminiModel.GEMINI_EMBEDDING_EXP_03_07
	);

	const embedding = await geminiEmbeddingClient.embedContent(text); // Should return number[]
	const userQuotes = await Quote.find({ user: user._id })
		.sort({ createdAt: -1 })
		.limit(50);
	const isNearDuplicate = userQuotes.some(
		(q) => cosineSimilarity(q.embedding, embedding) > 0.85
	);

	if (isNearDuplicate)
		throw new Error("Near-duplicate quote detected (embedding)");

	// Save quote
	const quote: IQuote = await Quote.create({
		text,
		hash,
		embedding,
		user: user._id,
		prompt: promptId,
	});

	return quote.text;
}

// Helper for cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
	const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
	const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
	const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
	return dot / (normA * normB);
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

	const token: IToken | null = await Token.findOne({
		access_token: accessToken,
	});

	if (!token) {
		throw new Error("Token not found");
	}

	return token.user_id;
}

/**
 * Save a generated quote to the database and associate it with a user.
 * If the quote is a duplicate or near-duplicate, it will retry up to maxRetries times.
 * @param threadsAccessToken The user's Threads access token
 * @param quotesToAvoid A list of quotes to avoid generating duplicates of.
 * @param maxRetries Maximum number of attempts to get a unique quote
 * @param prompt An optional prompt to guide quote generation.
 * @returns The saved quote document
 */
export async function saveUniqueGeminiQuote(
	threadsAccessToken: string,
	quotesToAvoid: string[],
	maxRetries = 5,
	prompt?: string,
	promptId?: string
): Promise<string> {
	const geminiTextClient = new GeminiClient(GeminiModel.GEMINI_2_0_FLASH);
	let lastError = null;

	// Base prompt with clear instructions
	const basePrompt =
		prompt
			? `Generate a response based on the user's request, which is enclosed in <user_prompt> tags: <user_prompt>${prompt}</user_prompt>`
			: `Generate a short, original motivational quote in Spanish. Return only the quote itself.`

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		let currentPrompt = basePrompt;

		// Always add the list of quotes to avoid, if any exist, wrapped in delimiters.
		if (quotesToAvoid.length > 0) {
			const avoidList = quotesToAvoid.map((q) => `- "${q}"`).join("\n");
			currentPrompt += `\n\nIMPORTANT: Do not generate a response similar to any of the following, which are enclosed in <avoid_list> tags:\n<avoid_list>\n${avoidList}\n</avoid_list>`;
		}

		const text = await geminiTextClient.generateContent(currentPrompt);
		try {
			// Reuse the deduplication and save logic
			return await saveGeminiQuote(text, threadsAccessToken, promptId);
		} catch (err: any) {
			lastError = err;
			// Only retry on deduplication errors
			if (
				err.message?.includes("Duplicate quote detected") ||
				err.message?.includes("Near-duplicate quote detected")
			) {
				// Add the failed quote to the list to avoid in the next attempt
				if (!quotesToAvoid.includes(text)) {
					quotesToAvoid.push(text);
				}
				continue;
			} else {
				throw err;
			}
		}
	}

	throw new Error(
		`No unique quote could be generated after ${maxRetries} attempts. Last error: ${
			lastError?.message || lastError
		}`
	);
}

/**
 * Deletes a user and all their associated data from the database.
 * This includes their quotes and API tokens.
 *
 * @param metaUserId The user's unique ID from Meta.
 * @returns An object indicating the success status and the number of deleted documents.
 * @throws An error if the user cannot be found or if any of the deletion steps fail.
 */
export async function deleteUserAndAssociatedData(metaUserId: string): Promise<{
	success: boolean;
	deletedQuotes: number;
	deletedTokens: number;
	deletedUsers: number;
}> {
	await connectToDB();

	// 1. Find the user by their Meta user ID
	const user = await User.findOne({ meta_user_id: metaUserId });

	if (!user) {
		// If the user is not found, there is no data to delete.
		// This is not an error, as the goal is to have no data for this user.
		console.log(
			`Data Deletion: User with meta_user_id ${metaUserId} not found. No data to delete.`
		);
		return {
			success: true,
			deletedQuotes: 0,
			deletedTokens: 0,
			deletedUsers: 0,
		};
	}

	const userId = user._id;

	// 2. Delete all quotes associated with the user
	const quoteDeletionResult = await Quote.deleteMany({ user: userId });

	// 3. Delete all tokens associated with the user
	const tokenDeletionResult = await Token.deleteMany({ user_id: metaUserId });

	// 4. Delete the user document itself
	const userDeletionResult = await User.deleteOne({ _id: userId });

	console.log(
		`Data Deletion: Successfully deleted data for user ${metaUserId}.`
	);
	console.log(`- Deleted ${quoteDeletionResult.deletedCount} quotes.`);
	console.log(`- Deleted ${tokenDeletionResult.deletedCount} tokens.`);
	console.log(`- Deleted ${userDeletionResult.deletedCount} users.`);

	return {
		success: true,
		deletedQuotes: quoteDeletionResult.deletedCount || 0,
		deletedTokens: tokenDeletionResult.deletedCount || 0,
		deletedUsers: userDeletionResult.deletedCount || 0,
	};
}

export async function savePrompt(text: string, threadsAccessToken: string): Promise<string> {
    const metaUserId = await getMetaUserIdByThreadsAccessToken(threadsAccessToken);
    const user = await User.findOne({ meta_user_id: metaUserId });
    if (!user) throw new Error("User not found");

    const prompt = await Prompt.create({ text, user: user._id });

    user.active_prompt = prompt._id;
    await user.save();

    return prompt.text;
}

export async function getActivePrompt(threadsAccessToken: string): Promise<string | null> {
    const metaUserId = await getMetaUserIdByThreadsAccessToken(threadsAccessToken);
    const user = await User.findOne({ meta_user_id: metaUserId }).populate('active_prompt');
    if (!user || !user.active_prompt) return null;

    return (user.active_prompt as any).text;
}

export async function getTokenExpiration(threadsAccessToken: string): Promise<number | null> {
    const token = await Token.findOne({ access_token: threadsAccessToken });
    if (!token) return null;

    return token.last_updated + token.expires_in;
}
