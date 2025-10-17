import { NextRequest, NextResponse } from "next/server";
import { savePrompt } from "@/app/lib/database/actions";
import { getThreadsCookie } from "@/app/lib/threads-api/threads-posts/actions";
import { connectToDB } from "@/app/lib/database/db";
import { generateQuoteSchema } from "./schema";

export async function POST(req: NextRequest) {
	await connectToDB();
	const body = await req.json();
	const accessTokenCookie = await getThreadsCookie();

	if (!accessTokenCookie) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const validation = generateQuoteSchema.safeParse(body);

	    if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid request data", issues: validation.error.flatten() },
				{ status: 400 }
			);
		}
	const { prompt: validatedPrompt } = validation.data;

	try {
		const savedPrompt = await savePrompt(validatedPrompt, accessTokenCookie);
		return NextResponse.json({ promptText: savedPrompt });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to save prompt" },
			{ status: 500 }
		);
	}
}
