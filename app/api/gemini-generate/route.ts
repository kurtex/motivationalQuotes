import { NextRequest, NextResponse } from "next/server";
import { savePrompt } from "@/app/lib/database/actions";
import { getThreadsCookie } from "@/app/lib/threads-api/threads-posts/actions";
import { connectToDB } from "@/app/lib/database/db";

export async function POST(req: NextRequest) {
	await connectToDB();
	const { prompt } = await req.json();
	const accessTokenCookie = await getThreadsCookie();

	if (!accessTokenCookie) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const savedPrompt = await savePrompt(prompt, accessTokenCookie);
		return NextResponse.json({ promptText: savedPrompt });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to save prompt" },
			{ status: 500 }
		);
	}
}
