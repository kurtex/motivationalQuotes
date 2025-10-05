export type ScheduleType = "daily" | "weekly" | "monthly" | "custom";
export type ScheduleStatus = "active" | "paused" | "error";
export type IntervalUnit = "hours" | "days" | "weeks";

export interface SerializedScheduledPost {
	_id: string;
	userId: string;
	scheduleType: ScheduleType;
	intervalValue?: number;
	intervalUnit?: IntervalUnit;
	timeOfDay: string;
	timeZoneId: string;
	lastPostedAt?: string;
	nextScheduledAt: string;
	status: ScheduleStatus;
	createdAt: string;
	updatedAt: string;
}
