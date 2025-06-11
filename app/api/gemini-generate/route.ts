import { NextRequest, NextResponse } from "next/server";
import { saveUniqueGeminiQuote } from "@/app/lib/database/actions";

export async function POST(req: NextRequest) {
	const { accessToken } = await req.json();
	const prompt = `Generate a short, original motivational quote. 
                    The language must be Spanish. 
                    Return only the motivational quote in Spanish, no english.`;

	try {
		const quoteText = await saveUniqueGeminiQuote(accessToken, prompt, 5);

		return NextResponse.json({ quoteText });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to generate quote" },
			{ status: 500 }
		);
	}
}
