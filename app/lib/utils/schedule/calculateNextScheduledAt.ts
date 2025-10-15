import type { IntervalUnit, ScheduleType } from "../../types/schedule";
import {
	addDaysInTimeZone,
	addHoursInTimeZone,
	addMonthsInTimeZone,
	getZonedDateTimeParts,
	setTimeOnLocalParts,
	zonedTimeToUtc,
} from "./timezone";

interface LocalDateTime {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
}

/**
 * Calculates the next scheduled execution time for a recurring post.
 * Accepts an optional reference date to make tests easier.
 */
export function calculateNextScheduledAt(
	scheduleType: ScheduleType,
	timeOfDay: string,
	timeZoneId: string,
	intervalValue?: number,
	intervalUnit?: IntervalUnit,
	referenceDate: Date = new Date()
): Date {
	const [targetHour, targetMinute] = timeOfDay.split(":").map(Number);
	const now = referenceDate;

	let localCandidate = setTimeOnLocalParts(
		getZonedDateTimeParts(now, timeZoneId),
		targetHour,
		targetMinute
	);

	let candidateUtc = zonedTimeToUtc(localCandidate, timeZoneId);

	const MAX_ITERATIONS = 10_000; // Safety guard
	let iterations = 0;

	const advanceLocalBySchedule = () => {
		if (scheduleType === "daily") {
			return setTimeOnLocalParts(
				addDaysInTimeZone(localCandidate, timeZoneId, 1),
				targetHour,
				targetMinute
			);
		}

		if (scheduleType === "weekly") {
			return setTimeOnLocalParts(
				addDaysInTimeZone(localCandidate, timeZoneId, 7),
				targetHour,
				targetMinute
			);
		}

		if (scheduleType === "monthly") {
			return setTimeOnLocalParts(
				addMonthsInTimeZone(localCandidate, timeZoneId, 1),
				targetHour,
				targetMinute
			);
		}

		if (scheduleType === "custom" && intervalValue && intervalUnit) {
			if (intervalUnit === "hours") {
				return addHoursInTimeZone(localCandidate, timeZoneId, intervalValue);
			}
			if (intervalUnit === "days") {
				return setTimeOnLocalParts(
					addDaysInTimeZone(localCandidate, timeZoneId, intervalValue),
					targetHour,
					targetMinute
				);
			}
			if (intervalUnit === "weeks") {
				return setTimeOnLocalParts(
					addDaysInTimeZone(localCandidate, timeZoneId, intervalValue * 7),
					targetHour,
					targetMinute
				);
			}
		}

		// Default: advance by one day to avoid infinite loops
		return setTimeOnLocalParts(
			addDaysInTimeZone(localCandidate, timeZoneId, 1),
			targetHour,
			targetMinute
		);
	};

	while (candidateUtc <= now && iterations < MAX_ITERATIONS) {
		localCandidate = advanceLocalBySchedule();
		candidateUtc = zonedTimeToUtc(localCandidate, timeZoneId);
		iterations += 1;
	}

	return candidateUtc;
}
