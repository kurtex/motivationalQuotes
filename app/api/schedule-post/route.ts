import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/database/db";
import ScheduledPost from "@/app/lib/database/models/ScheduledPost";
import { getCookie } from "@/app/lib/utils/cookies/actions";
import User from "@/app/lib/database/models/User";
import { getMetaUserIdByThreadsAccessToken } from "@/app/lib/database/actions";
import { calculateNextScheduledAt } from "@/app/lib/utils/schedule/calculateNextScheduledAt";
import { schedulePostSchema } from "./schema";

export async function POST(req: NextRequest) {
	await connectToDB();

	try {
		const body = await req.json();
		const validation = schedulePostSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid request data", issues: validation.error.flatten() },
				{ status: 400 }
			);
		}

		const {
			scheduleType,
			intervalValue,
			intervalUnit,
			timeOfDay,
			timeZoneId,
		} = validation.data;

		const threadsToken = await getCookie("threads-token");
		if (!threadsToken) {
			return NextResponse.json(
				{ error: "Unauthorized: No Threads token found" },
				{ status: 401 }
			);
		}

		// Find the user associated with the threads token
		let metaUserId: string;
		try {
			metaUserId = await getMetaUserIdByThreadsAccessToken(threadsToken);
		} catch (err) {
			return NextResponse.json(
				{ error: "Unauthorized: Invalid Threads token" },
				{ status: 401 }
			);
		}

		const user = await User.findOne({ meta_user_id: metaUserId });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Calculate the initial nextScheduledAt
		const nextScheduledAt = calculateNextScheduledAt(
			scheduleType,
			timeOfDay,
			timeZoneId,
			intervalValue,
			intervalUnit
		);

		// Find existing schedule for this user
		let scheduledPost = await ScheduledPost.findOne({ userId: user._id });

		if (scheduledPost) {
			// Update existing schedule
			scheduledPost.scheduleType = scheduleType;
			scheduledPost.intervalValue = intervalValue;
			scheduledPost.intervalUnit = intervalUnit;
			scheduledPost.timeOfDay = timeOfDay;
			scheduledPost.nextScheduledAt = nextScheduledAt;
			scheduledPost.timeZoneId = timeZoneId;
			scheduledPost.status = "active"; // Reactivate if it was paused/error
			await scheduledPost.save();
		} else {
			// Create new schedule
			scheduledPost = new ScheduledPost({
				userId: user._id,
				scheduleType,
				intervalValue,
				intervalUnit,
				timeOfDay,
				nextScheduledAt,
				timeZoneId,
				status: "active",
			});
			await scheduledPost.save();
		}

		return NextResponse.json(
			{
				message: "Schedule updated successfully",
				scheduleId: scheduledPost._id,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error updating schedule:", error);
		return NextResponse.json(
			{ error: "An internal server error occurred." },
			{ status: 500 }
		);
	}
}
