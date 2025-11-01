import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/database/db";
import ScheduledPost from "@/app/lib/database/models/ScheduledPost";
import User from "@/app/lib/database/models/User";
import { getMetaUserIdByThreadsAccessToken } from "@/app/lib/database/actions";
import { getThreadsCookie } from "@/app/lib/threads-api/threads-posts/actions";
import { calculateNextScheduledAt } from "@/app/lib/utils/schedule/calculateNextScheduledAt";

export async function POST() {
	try {
		await connectToDB();

		const threadsToken = await getThreadsCookie();
		const metaUserId = await getMetaUserIdByThreadsAccessToken(threadsToken);
		const user = await User.findOne({ meta_user_id: metaUserId });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const scheduledPost = await ScheduledPost.findOne({ userId: user._id });

		if (!scheduledPost) {
			return NextResponse.json({ error: "No scheduled post found" }, { status: 404 });
		}

		if (scheduledPost.status !== "error") {
			return NextResponse.json(
				{ error: "Schedule is not in an error state" },
				{ status: 400 }
			);
		}

		scheduledPost.nextScheduledAt = calculateNextScheduledAt(
			scheduledPost.scheduleType,
			scheduledPost.timeOfDay,
			scheduledPost.timeZoneId ?? "UTC",
			scheduledPost.intervalValue,
			scheduledPost.intervalUnit
		);
		scheduledPost.status = "active";
		await scheduledPost.save();

		return NextResponse.json(
			{
				message: "Schedule reactivated for the next rotation",
				nextScheduledAt: scheduledPost.nextScheduledAt.toISOString(),
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error reactivating schedule:", error);
		if (error.message === "Access token is required") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		return NextResponse.json(
			{ error: "An internal server error occurred." },
			{ status: 500 }
		);
	}
}
