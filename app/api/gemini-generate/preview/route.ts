import { NextRequest, NextResponse } from "next/server";
import { getThreadsCookie } from "../../../lib/threads-api/threads-posts/actions";
import { getMetaUserIdByThreadsAccessToken } from "../../../lib/database/actions";
import User from "../../../lib/database/models/User";
import Quote from "../../../lib/database/models/Quote";
import { generateGeminiStream } from "../../../lib/ai/geminiClient"; // Changed import
import { previewSchema } from "./schema";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const validation = previewSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(
            { error: "Invalid request data", issues: validation.error.flatten() },
            { status: 400 }
        );
    }

    const { prompt } = validation.data;
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

        let currentPrompt = `Generate a response based on the user's request, which is enclosed in <user_prompt> tags: <user_prompt>${prompt}</user_prompt>`;
        if (quotesToAvoid.length > 0) {
            const avoidList = quotesToAvoid.map((q) => `- \"${q}\"`).join("\n");
            currentPrompt += `\n\nIMPORTANT: Do not generate a response similar to any of the following, which are enclosed in <avoid_list> tags:\n<avoid_list>\n${avoidList}\n</avoid_list>`;
        }

        // Changed to use the streaming function
        const stream = await generateGeminiStream(currentPrompt);

        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.text();
                    controller.enqueue(new TextEncoder().encode(text));
                }
                controller.close();
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });

    } catch (error: any) {
        // It's important to handle errors inside the stream as well, but for now, this will catch initial setup errors.
        console.error("Error in preview stream route:", error);
        return NextResponse.json(
            { error: "An internal server error occurred." },
            { status: 500 }
        );
    }
}