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

	const ensureFutureCandidate = () => {
		if (candidateUtc > now) {
			return;
		}

		const advanceLocal = (updater: () => LocalDateTime) => {
			localCandidate = updater();
			candidateUtc = zonedTimeToUtc(localCandidate, timeZoneId);
		};

		if (scheduleType === "daily") {
			advanceLocal(() =>
				setTimeOnLocalParts(
					addDaysInTimeZone(localCandidate, timeZoneId, 1),
					targetHour,
					targetMinute
				)
			);
			return ensureFutureCandidate();
		}

		if (scheduleType === "weekly") {
			advanceLocal(() =>
				setTimeOnLocalParts(
					addDaysInTimeZone(localCandidate, timeZoneId, 7),
					targetHour,
					targetMinute
				)
			);
			return ensureFutureCandidate();
		}

		if (scheduleType === "monthly") {
			advanceLocal(() =>
				setTimeOnLocalParts(
					addMonthsInTimeZone(localCandidate, timeZoneId, 1),
					targetHour,
					targetMinute
				)
			);
			return ensureFutureCandidate();
		}

		if (scheduleType === "custom" && intervalValue && intervalUnit) {
			if (intervalUnit === "hours") {
				advanceLocal(() => addHoursInTimeZone(localCandidate, timeZoneId, intervalValue));
			} else if (intervalUnit === "days") {
				advanceLocal(() =>
					setTimeOnLocalParts(
						addDaysInTimeZone(localCandidate, timeZoneId, intervalValue),
						targetHour,
						targetMinute
					)
				);
			} else if (intervalUnit === "weeks") {
				advanceLocal(() =>
					setTimeOnLocalParts(
						addDaysInTimeZone(localCandidate, timeZoneId, intervalValue * 7),
						targetHour,
						targetMinute
					)
				);
			}
			return ensureFutureCandidate();
		}

		// Default advance: add one minute to avoid infinite loop
		advanceLocal(() => addHoursInTimeZone(localCandidate, timeZoneId, 1 / 60));
		return ensureFutureCandidate();
	};

	ensureFutureCandidate();

	return candidateUtc;
}
