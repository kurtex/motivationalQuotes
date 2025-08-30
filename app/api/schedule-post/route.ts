import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/database/db";
import ScheduledPost, {
	IScheduledPost,
} from "@/app/lib/database/models/ScheduledPost"; // Import IScheduledPost
import { getCookie } from "@/app/lib/utils/cookies/actions";
import Token from "@/app/lib/database/models/Token";
import User from "@/app/lib/database/models/User";

// Helper function to calculate the next scheduled time
function calculateNextScheduledAt(
	scheduleType: IScheduledPost["scheduleType"],
	timeOfDay: string, // HH:MM
	intervalValue?: number,
	intervalUnit?: IScheduledPost["intervalUnit"]
): Date {
	const [hours, minutes] = timeOfDay.split(":").map(Number);
	let nextDate = new Date();
	nextDate.setSeconds(0);
	nextDate.setMilliseconds(0);

	// Set the time of day
	nextDate.setHours(hours);
	nextDate.setMinutes(minutes);

	// If the calculated time is in the past, move to the next day
	if (nextDate.getTime() < Date.now()) {
		nextDate.setDate(nextDate.getDate() + 1);
	}

	if (scheduleType === "weekly") {
		nextDate.setDate(nextDate.getDate() + 7);
	} else if (scheduleType === "monthly") {
		nextDate.setMonth(nextDate.getMonth() + 1);
	} else if (scheduleType === "custom" && intervalValue && intervalUnit) {
		const now = new Date();
		let currentIntervalDate = new Date(now);
		currentIntervalDate.setHours(hours, minutes, 0, 0);

		// If the current interval date is in the past, move to the next interval
		while (currentIntervalDate.getTime() < now.getTime()) {
			if (intervalUnit === "hours") {
				currentIntervalDate.setHours(
					currentIntervalDate.getHours() + intervalValue
				);
			} else if (intervalUnit === "days") {
				currentIntervalDate.setDate(
					currentIntervalDate.getDate() + intervalValue
				);
			} else if (intervalUnit === "weeks") {
				currentIntervalDate.setDate(
					currentIntervalDate.getDate() + intervalValue * 7
				);
			}
		}
		nextDate = currentIntervalDate;
	}
	// For 'daily' and 'weekly', the initial 'nextDate' calculation (today/tomorrow at timeOfDay) is sufficient.
	// 'weekly' might need more complex logic if specific day of week is required, but for now,
	// it implies 'same day next week' if today's time has passed.

	return nextDate;
}

export async function POST(req: NextRequest) {
	await connectToDB();

	try {
		const { scheduleType, intervalValue, intervalUnit, timeOfDay } =
			await req.json();

		if (!scheduleType || !timeOfDay) {
			return NextResponse.json(
				{ error: `Schedule type or time of day missing. scheduleType: ${scheduleType}, timeOfDay: ${timeOfDay}` },
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
		const tokenDoc = await Token.findOne({ access_token: threadsToken });
		if (!tokenDoc) {
			return NextResponse.json(
				{ error: "Unauthorized: Invalid Threads token" },
				{ status: 401 }
			);
		}

		const user = await User.findOne({ meta_user_id: tokenDoc.user_id });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Calculate the initial nextScheduledAt
		const nextScheduledAt = calculateNextScheduledAt(
			scheduleType,
			timeOfDay,
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
