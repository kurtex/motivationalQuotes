import { NextRequest, NextResponse } from "next/server";
import { getThreadsCookie } from "../../../lib/threads-api/threads-posts/actions";
import { getMetaUserIdByThreadsAccessToken } from "../../../lib/database/actions";
import User from "../../../lib/database/models/User";
import Quote from "../../../lib/database/models/Quote";
import { GeminiClient } from "../../../lib/ai/geminiClient";
import { GeminiModel } from "../../../lib/ai/geminiModels";

export async function POST(req: NextRequest) {
    const { prompt } = await req.json();
    const accessTokenCookie = await getThreadsCookie();

    if (!accessTokenCookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const metaUserId = await getMetaUserIdByThreadsAccessToken(accessTokenCookie);
        const user = await User.findOne({ meta_user_id: metaUserId });
        if (!user) {
            throw new Error("User not found");
        }

        const recentQuotes = await Quote.find({ user: user._id, prompt: user.active_prompt })
            .sort({ createdAt: -1 })
            .limit(30)
            .select("text");

        const quotesToAvoid = recentQuotes.map((q: any) => q.text);

        const geminiTextClient = new GeminiClient(GeminiModel.GEMINI_2_0_FLASH);

        let currentPrompt = `Generate a response based on the user's request, which is enclosed in <user_prompt> tags: <user_prompt>${prompt}</user_prompt>`;
        if (quotesToAvoid.length > 0) {
            const avoidList = quotesToAvoid.map((q) => `- \"${q}\"`).join("\n");
            currentPrompt += `\n\nIMPORTANT: Do not generate a response similar to any of the following, which are enclosed in <avoid_list> tags:\n<avoid_list>\n${avoidList}\n</avoid_list>`;
        }

        const text = await geminiTextClient.generateContent(currentPrompt);

        return NextResponse.json({ quoteText: text });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to generate preview" },
            { status: 500 }
        );
    }
}
