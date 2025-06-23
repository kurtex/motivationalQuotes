import { NextRequest, NextResponse } from "next/server";
import { saveUniqueGeminiQuote } from "@/app/lib/database/actions";
import Quote from "@/app/lib/database/models/Quote";
import User from "@/app/lib/database/models/User";
import { getMetaUserIdByThreadsAccessToken } from "@/app/lib/database/actions";

export async function POST(req: NextRequest) {
	const { accessToken, lastQuote } = await req.json();
	let prompt = `Generate a short, original motivational quote.\nThe language must be Spanish.\nReturn only the motivational quote in Spanish, no english.`;
	try {
		// Obtener el user_id de Meta a partir del accessToken
		const metaUserId = await getMetaUserIdByThreadsAccessToken(accessToken);
		// Buscar el usuario en la base de datos
		const user = await User.findOne({ meta_user_id: metaUserId });
		let recentQuotes: string[] = [];
		if (user) {
			// Buscar las últimas 30 frases del usuario
			const quotes = await Quote.find({ user: user._id })
				.sort({ createdAt: -1 })
				.limit(30)
				.select("text");
			recentQuotes = quotes.map((q: any) => q.text);
		}
		// Construir la sección de exclusión en el prompt
		if (recentQuotes.length > 0) {
			prompt += `\nDo NOT repeat or generate anything similar to these quotes:`;
			for (const q of recentQuotes) {
				prompt += `\n- \"${q}\"`;
			}
		} else if (lastQuote) {
			prompt += `\nDo NOT repeat or generate anything similar to this quote: \"${lastQuote}\".`;
		}
		const quoteText = await saveUniqueGeminiQuote(accessToken, prompt, 20);
		return NextResponse.json({ quoteText });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to generate quote" },
			{ status: 500 }
		);
	}
}
