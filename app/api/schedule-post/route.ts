import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/database/db";
import ScheduledPost, {
	IScheduledPost,
} from "@/app/lib/database/models/ScheduledPost"; // Import IScheduledPost
import { getCookie } from "@/app/lib/utils/cookies/actions";
import User from "@/app/lib/database/models/User";
import { getMetaUserIdByThreadsAccessToken } from "@/app/lib/database/actions";
import { calculateNextScheduledAt } from "@/app/lib/utils/schedule/calculateNextScheduledAt";

export async function POST(req: NextRequest) {
	await connectToDB();

	try {
		const { scheduleType, intervalValue, intervalUnit, timeOfDay, timeZoneId } =
			await req.json();

		if (!scheduleType || !timeOfDay) {
			return NextResponse.json(
				{
					error: `Schedule type or time of day missing. scheduleType: ${scheduleType}, timeOfDay: ${timeOfDay}`,
				},
				{ status: 400 }
			);
		}
		if (!timeZoneId || typeof timeZoneId !== "string") {
			return NextResponse.json(
				{
					error:
						"Missing or invalid timeZoneId. Provide a valid IANA timezone identifier.",
				},
				{ status: 400 }
			);
		}
		if (scheduleType === "custom" && (!intervalValue || !intervalUnit)) {
			if (!["hours", "days", "weeks"].includes(intervalUnit)) {
				return NextResponse.json(
					{
						error:
							"Invalid interval unit. Allowed values are 'hours', 'days', 'weeks'.",
					},
					{ status: 400 }
				);
			}
		}

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
			{ error: error.message || "Failed to update schedule" },
			{ status: 500 }
		);
	}
}
