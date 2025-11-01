import { NextRequest, NextResponse } from "next/server";
import { postThreadAction } from "@/app/lib/threads-api/threads-posts/actions";
import { saveUniqueGeminiQuote } from "@/app/lib/database/actions"; // Import saveUniqueGeminiQuote
import { getCookie } from "@/app/lib/utils/cookies/actions"; // Import getCookie
import { postNowSchema } from "./schema";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const validation = postNowSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid request data", issues: validation.error.flatten() },
				{ status: 400 }
			);
		}

		const { prompt } = validation.data;

		const threadsToken = await getCookie("threads-token");
		if (!threadsToken) {
			return NextResponse.json(
				{ error: "Unauthorized: No Threads token found" },
				{ status: 401 }
			);
		}

		// Generate quote from prompt
		const generatedQuote = await saveUniqueGeminiQuote(
			threadsToken,
			[], // No quotes to avoid for immediate posts, as it's a new generation
			5, // Max retries
			prompt // Use the provided prompt
		);

		// Create a FormData object to mimic the original server action's expected input
		const formData = new FormData();
		formData.append("thread_post", generatedQuote); // Use generatedQuote

		await postThreadAction(formData);

		return NextResponse.json(
			{ message: "Quote posted successfully", quote: generatedQuote },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error posting quote immediately:", error);
		return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
	}
}
