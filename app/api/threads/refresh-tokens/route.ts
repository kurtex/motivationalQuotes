import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/database/db";
import Token from "@/app/lib/database/models/Token";
import { refreshLongLivedToken } from "@/app/lib/threads-api/auth-tokens/actions";

// 1 day in seconds
const ONE_DAY_IN_SECONDS = 86400;
const BATCH_SIZE = 100; // Process 100 tokens at a time

export async function POST(req: NextRequest) {
	// Protection: require the Vercel CRON_SECRET
	const authHeader = req.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await connectToDB();
	const now = Math.floor(Date.now() / 1000);
	let refreshed = 0;
	let errors: any[] = [];
	let page = 0;
	let hasMore = true;

	while (hasMore) {
		const tokens = await Token.find()
			.skip(page * BATCH_SIZE)
			.limit(BATCH_SIZE);

		if (tokens.length === 0) {
			hasMore = false;
			continue;
		}

		for (const token of tokens) {
			const expiresAt = token.last_updated + token.expires_in;
			const remaining = expiresAt - now;
			if (remaining < ONE_DAY_IN_SECONDS) {
				try {
					const response = await refreshLongLivedToken(token.access_token);
					token.access_token = response.access_token;
					token.expires_in = response.expires_in;
					token.last_updated = now;
					await token.save();
					refreshed++;
				} catch (error) {
					errors.push({ user_id: token.user_id, error: String(error) });
				}
			}
		}

		page++;
	}

	return NextResponse.json({ refreshed, errors });
}
