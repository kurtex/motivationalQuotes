import { saveGeminiQuote } from "@/app/lib/database/actions";
import { getCookie } from "@/app/lib/utils/cookies/actions";
import { NextRequest, NextResponse } from "next/server";
import { getGeminiQuotes } from "@/app/lib/database/actions";
import { IQuote } from "@/app/lib/database/models/Quote";

export async function POST(req: NextRequest) {
	const GEMINI_API_URL =
		"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
	const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

	if (!GEMINI_API_KEY) {
		return NextResponse.json(
			{ error: "Gemini API key not set" },
			{ status: 500 }
		);
	}

	const accessToken = await getCookie("threads-token");
	if (!accessToken) {
		return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
	}
	const quotes = await getGeminiQuotes(accessToken);

	let prompt = `Generate a short, original motivational quote. 
                    The language must be Spanish. 
                    Return only the motivational quote in Spanish, no english.
                    Try to return a new quote each time.
					Avoid using these quotes: ${quotes
						.map((q: IQuote) => `"${q.text}"`)
						.join(", ")}`;

	const body = {
		contents: [{ parts: [{ text: prompt }] }],
	};

	const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const error = await response.text();
		return NextResponse.json({ error }, { status: response.status });
	}

	const data = await response.json();
	const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

	// Save quote to DB and associate with user
	try {
		const accessToken = await getCookie("threads-token");
		if (accessToken && text) {
			await saveGeminiQuote(text, accessToken);
		}
	} catch (err) {
		console.error("Failed to save quote:", err);
	}

	return NextResponse.json({ text });
}
