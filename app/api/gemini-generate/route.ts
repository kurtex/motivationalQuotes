import { NextRequest, NextResponse } from "next/server";
import { savePrompt } from "@/app/lib/database/actions";
import { getThreadsCookie } from "@/app/lib/threads-api/threads-posts/actions";
import { connectToDB } from "@/app/lib/database/db";

const MAX_PROMPT_LENGTH = 1000;

export async function POST(req: NextRequest) {
	await connectToDB();
	const body = await req.json();
	const rawPrompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
	const accessTokenCookie = await getThreadsCookie();

	if (!accessTokenCookie) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!rawPrompt) {
		return NextResponse.json(
			{ error: "Prompt is required" },
			{ status: 400 }
		);
	}

	if (rawPrompt.length > MAX_PROMPT_LENGTH) {
		return NextResponse.json(
			{ error: "Prompt is too long" },
			{ status: 400 }
		);
	}

	try {
		const savedPrompt = await savePrompt(rawPrompt, accessTokenCookie);
		return NextResponse.json({ promptText: savedPrompt });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to save prompt" },
			{ status: 500 }
		);
	}
}
