import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/database/db";
import ScheduledPost from "@/app/lib/database/models/ScheduledPost";
import Quote from "@/app/lib/database/models/Quote"; // Import Quote model
import {
	createThreadTextContainer,
	postThreadsTextContainer,
} from "@/app/lib/threads-api/threads-posts/actions";
import Token from "@/app/lib/database/models/Token";
import {
	saveUniqueGeminiQuote,
	getPlainThreadsToken,
} from "@/app/lib/database/actions"; // To generate quote from prompt
import { calculateNextScheduledAt } from "@/app/lib/utils/schedule/calculateNextScheduledAt";

export async function POST(req: NextRequest) {
	// Basic security: require a secret header for cron jobs
	let authHeader =
		req.headers.get("authorization") ?? req.headers.get("Authorization");

	if (!authHeader && typeof req.headers.entries === "function") {
		for (const [key, value] of req.headers.entries()) {
			if (key.toLowerCase() === "authorization") {
				authHeader = value;
				break;
			}
		}
	}

	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await connectToDB();
	const now = new Date();
	let processedCount = 0;
	let errors: any[] = [];

	try {
		// Find active schedules that are due now or in the past
			const duePosts = await ScheduledPost.find({
				nextScheduledAt: { $lte: now },
				status: "active",
			})
				.populate({
					path: "userId",
					select: "_id active_prompt meta_user_id",
					populate: {
						path: "active_prompt",
						select: "text",
					},
				})
				.select("_id userId nextScheduledAt status scheduleType timeOfDay intervalValue intervalUnit timeZoneId")
			.limit(100) // Limit the number of posts processed in one batch
			.exec();

		for (const post of duePosts) {
			try {
				const user = post.userId as any; // Cast to any to access populated fields
				if (!user || !user.active_prompt) {
					console.log(
						`Skipping scheduled post for user ${user?._id}: No active prompt found.`
					);
					post.status = "paused"; // Pause schedule if no active prompt
					await post.save();
					continue;
				}

				const userToken = await Token.findOne({ user_id: user.meta_user_id });
				if (!userToken) {
					console.log(
						`Skipping scheduled post for user ${user._id}: No token found.`
					);
					post.status = "paused"; // Pause schedule if no token
					await post.save();
					continue;
				}

				const accessToken = await getPlainThreadsToken(userToken);

				// 1. Generate quote from active prompt
				const recentQuotes = await Quote.find({
					user: user._id,
					prompt: user.active_prompt,
				})
					.sort({ createdAt: -1 })
					.limit(30)
					.select("text");

				const quotesToAvoid = recentQuotes.map((q: any) => q.text);

				const generatedQuote = await saveUniqueGeminiQuote(
					accessToken,
					quotesToAvoid, // Pass quotes to avoid for recurring posts
					5, // Max retries
					(user.active_prompt as any).text // Use the text from the populated active_prompt
				);

				// 2. Post to Threads
				const threadsContainerId = await createThreadTextContainer(
					generatedQuote,
					accessToken
				);
				await new Promise((resolve) => setTimeout(resolve, 3000)); // Respect the 3-second delay
				await postThreadsTextContainer(threadsContainerId, accessToken);

				// 3. Update schedule for next occurrence using stored timezone
				post.lastPostedAt = now;
				post.nextScheduledAt = calculateNextScheduledAt(
					post.scheduleType,
					post.timeOfDay,
					post.timeZoneId ?? "UTC",
					post.intervalValue,
					post.intervalUnit,
					now
				);
				post.status = "active"; // Ensure status is active after successful post
				await post.save();
				processedCount++;
			} catch (err: any) {
				post.status = "error"; // Set status to error on failure
				await post.save(); // Save status even if it fails
				errors.push({ scheduleId: post._id, error: err.message });
				console.error(`Failed to process scheduled post ${post._id}:`, err);
			}
		}

		console.log(`Processed ${processedCount} posts successfully.`);

		return NextResponse.json({ processedCount, errors }, { status: 200 });
	} catch (error: any) {
		console.error("Error in check-scheduled-posts:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to check scheduled posts" },
			{ status: 500 }
		);
	}
}
