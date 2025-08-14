import { NextRequest, NextResponse } from "next/server";
import { postThreadAction } from "@/app/lib/threads-api/threads-posts/actions";
import { saveUniqueGeminiQuote } from "@/app/lib/database/actions"; // Import saveUniqueGeminiQuote
import { getCookie } from "@/app/lib/utils/cookies/actions"; // Import getCookie

export async function POST(req: NextRequest) {
	try {
		const { prompt } = await req.json(); // Receive prompt instead of quoteText

		if (!prompt) {
			return NextResponse.json(
				{ error: "Prompt is required" },
				{ status: 400 }
			);
		}

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

		console.log("Quote posted successfully:", generatedQuote);

		return NextResponse.json(
			{ message: "Quote posted successfully", quote: generatedQuote },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error posting quote immediately:", error);

		const errorMessage =
			error.message || "An unexpected error occurred while posting the quote.";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
