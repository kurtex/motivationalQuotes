import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
	const { prompt } = await req.json();
	if (!prompt) {
		return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
	}

	// Gemini 2.0 Flash API endpoint and key (user must set this in env)
	const GEMINI_API_URL =
		"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
	const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

	if (!GEMINI_API_KEY) {
		return NextResponse.json(
			{ error: "Gemini API key not set" },
			{ status: 500 }
		);
	}

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
	return NextResponse.json({ text });
}
