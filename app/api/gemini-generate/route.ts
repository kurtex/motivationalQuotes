import { NextRequest, NextResponse } from "next/server";
import { saveUniqueGeminiQuote } from "@/app/lib/database/actions";
import Quote from "@/app/lib/database/models/Quote";
import User from "@/app/lib/database/models/User";
import { getMetaUserIdByThreadsAccessToken } from "@/app/lib/database/actions";
import { getThreadsCookie } from "@/app/lib/threads-api/threads-posts/actions";

export async function POST(req: NextRequest) {
	const { lastQuote } = await req.json();
	const accessTokenCookie = await getThreadsCookie();

	if (!accessTokenCookie) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Obtener el user_id de Meta a partir del accessToken
		const metaUserId = await getMetaUserIdByThreadsAccessToken(
			accessTokenCookie
		);
		// Find the user in the database
		const user = await User.findOne({ meta_user_id: metaUserId });
		let recentQuotes: string[] = [];
		if (user) {
			// Find the last 30 quotes from the user
			const quotes = await Quote.find({ user: user._id })
				.sort({ createdAt: -1 })
				.limit(30)
				.select("text");
			recentQuotes = quotes.map((q: any) => q.text);
		}

		// If there are no recent quotes, but the last one was passed, use it
		if (recentQuotes.length === 0 && lastQuote) {
			recentQuotes.push(lastQuote);
		}

		const quoteText = await saveUniqueGeminiQuote(
			accessTokenCookie,
			recentQuotes,
			20
		);
		return NextResponse.json({ quoteText });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to generate quote" },
			{ status: 500 }
		);
	}
}
