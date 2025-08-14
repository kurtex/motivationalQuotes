import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/database/db";
import ScheduledPost, {
	IScheduledPost,
} from "@/app/lib/database/models/ScheduledPost";
import Quote from "@/app/lib/database/models/Quote"; // Import Quote model
import {
	createThreadTextContainer,
	postThreadsTextContainer,
} from "@/app/lib/threads-api/threads-posts/actions";
import Token from "@/app/lib/database/models/Token";
import { saveUniqueGeminiQuote } from "@/app/lib/database/actions"; // To generate quote from prompt

// Helper function to calculate the next scheduled occurrence
function calculateNextOccurrence(
	lastPostedAt: Date,
	scheduleType: IScheduledPost["scheduleType"],
	timeOfDay: string, // HH:MM
	intervalValue?: number,
	intervalUnit?: IScheduledPost["intervalUnit"]
): Date {
	const [hours, minutes] = timeOfDay.split(":").map(Number);
	let nextOccurrence = new Date(lastPostedAt);
	nextOccurrence.setSeconds(0);
	nextOccurrence.setMilliseconds(0);

	// Set the time of day for the next occurrence
	nextOccurrence.setHours(hours);
	nextOccurrence.setMinutes(minutes);

	// If setting the time of day makes it earlier than lastPostedAt, move to next day
	if (nextOccurrence.getTime() <= lastPostedAt.getTime()) {
		nextOccurrence.setDate(nextOccurrence.getDate() + 1);
	}

	if (scheduleType === "custom" && intervalValue && intervalUnit) {
		// Adjust for custom intervals
		while (nextOccurrence.getTime() <= lastPostedAt.getTime()) {
			if (intervalUnit === "hours") {
				nextOccurrence.setHours(nextOccurrence.getHours() + intervalValue);
			} else if (intervalUnit === "days") {
				nextOccurrence.setDate(nextOccurrence.getDate() + intervalValue);
			} else if (intervalUnit === "weeks") {
				nextOccurrence.setDate(nextOccurrence.getDate() + intervalValue * 7);
			}
		}
	}
	// For 'daily' and 'weekly', the initial 'nextOccurrence' calculation (today/tomorrow at timeOfDay) is sufficient.

	return nextOccurrence;
}

export async function POST(req: NextRequest) {
	// Basic security: require a secret header for cron jobs
	const secret = req.headers.get("x-cron-secret");
	if (secret !== process.env.CRON_SECRET) {
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
			.populate("userId", "_id active_prompt")
			.select("_id userId nextScheduledAt status")
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
					userToken.access_token,
					quotesToAvoid, // Pass quotes to avoid for recurring posts
					5, // Max retries
					(user.active_prompt as any).text // Use the text from the populated active_prompt
				);

				// 2. Post to Threads
				const threadsContainerId = await createThreadTextContainer(
					generatedQuote,
					userToken.access_token
				);
				await new Promise((resolve) => setTimeout(resolve, 3000)); // Respect the 3-second delay
				await postThreadsTextContainer(
					threadsContainerId,
					userToken.access_token
				);

				// 3. Update schedule for next occurrence
				post.lastPostedAt = now;
				post.nextScheduledAt = calculateNextOccurrence(
					now, // Use current time as lastPostedAt for next calculation
					post.scheduleType,
					post.timeOfDay,
					post.intervalValue,
					post.intervalUnit
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
