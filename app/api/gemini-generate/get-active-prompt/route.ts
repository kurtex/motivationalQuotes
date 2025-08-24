import { NextRequest, NextResponse } from "next/server";
import { getActivePrompt } from "@/app/lib/database/actions";
import { getThreadsCookie } from "@/app/lib/threads-api/threads-posts/actions";
import { connectToDB } from "@/app/lib/database/db";

export async function GET(req: NextRequest) {
	await connectToDB();
	const accessTokenCookie = await getThreadsCookie();

	if (!accessTokenCookie) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const activePrompt = await getActivePrompt(accessTokenCookie);
		return NextResponse.json({ promptText: activePrompt });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to get active prompt" },
			{ status: 500 }
		);
	}
}
