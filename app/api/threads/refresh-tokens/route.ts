import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/database/db";
import Token from "@/app/lib/database/models/Token";
import { refreshLongLivedToken } from "@/app/lib/threads-api/auth-tokens/actions";

// 1 day in seconds
const ONE_DAY_IN_SECONDS = 86400;

export async function POST(req: NextRequest) {
	// Simple protection: require a secret header
	const secret = req.headers.get("x-cron-secret");
	if (secret !== process.env.CRON_SECRET) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await connectToDB();
	const tokens = await Token.find();
	const now = Math.floor(Date.now() / 1000);
	let refreshed = 0;
	let errors: any[] = [];

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

	return NextResponse.json({ refreshed, errors });
}
