export interface ZonedDateTimeParts {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
}

const DATE_TIME_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string) {
	if (!DATE_TIME_FORMATTER_CACHE.has(timeZone)) {
		DATE_TIME_FORMATTER_CACHE.set(
			timeZone,
			new Intl.DateTimeFormat("en-US", {
				timeZone,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			})
		);
	}

	return DATE_TIME_FORMATTER_CACHE.get(timeZone)!;
}

export function getZonedDateTimeParts(date: Date, timeZone: string): ZonedDateTimeParts {
	const formatter = getFormatter(timeZone);
	const parts = formatter.formatToParts(date);
	const lookup: Record<string, number> = {};

	for (const part of parts) {
		if (part.type !== "literal") {
			lookup[part.type] = Number(part.value);
		}
	}

	return {
		year: lookup.year,
		month: lookup.month,
		day: lookup.day,
		hour: lookup.hour,
		minute: lookup.minute,
		second: lookup.second,
	};
}

function buildUTCDate(parts: ZonedDateTimeParts): Date {
	return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
}

function getTimeZoneOffset(date: Date, timeZone: string): number {
	const formatter = getFormatter(timeZone);
	const parts = formatter.formatToParts(date);
	const lookup: Record<string, number> = {};

	for (const part of parts) {
		if (part.type !== "literal") {
			lookup[part.type] = Number(part.value);
		}
	}

	const asUTC = Date.UTC(
		lookup.year,
		lookup.month - 1,
		lookup.day,
		lookup.hour,
		lookup.minute,
		lookup.second
	);

	return asUTC - date.getTime();
}

export function zonedTimeToUtc(parts: ZonedDateTimeParts, timeZone: string): Date {
	const initial = buildUTCDate(parts);
	const offset = getTimeZoneOffset(initial, timeZone);
	let utcDate = new Date(initial.getTime() - offset);

	// Re-calc in case of DST transitions
	const secondOffset = getTimeZoneOffset(utcDate, timeZone);
	if (secondOffset !== offset) {
		utcDate = new Date(initial.getTime() - secondOffset);
	}

	return utcDate;
}

export function setTimeOnLocalParts(
	parts: ZonedDateTimeParts,
	hour: number,
	minute: number
): ZonedDateTimeParts {
	return {
		year: parts.year,
		month: parts.month,
		day: parts.day,
		hour,
		minute,
		second: 0,
	};
}

export function addDaysInTimeZone(
	parts: ZonedDateTimeParts,
	timeZone: string,
	days: number
): ZonedDateTimeParts {
	const utcDate = zonedTimeToUtc(parts, timeZone);
	const adjusted = new Date(utcDate.getTime() + days * 24 * 60 * 60 * 1000);
	return getZonedDateTimeParts(adjusted, timeZone);
}

export function addMonthsInTimeZone(
	parts: ZonedDateTimeParts,
	timeZone: string,
	months: number
): ZonedDateTimeParts {
	const utcDate = zonedTimeToUtc(parts, timeZone);
	const adjusted = new Date(utcDate.getTime());
	adjusted.setUTCMonth(adjusted.getUTCMonth() + months);
	return getZonedDateTimeParts(adjusted, timeZone);
}

export function addHoursInTimeZone(
	parts: ZonedDateTimeParts,
	timeZone: string,
	hours: number
): ZonedDateTimeParts {
	const utcDate = zonedTimeToUtc(parts, timeZone);
	const adjusted = new Date(utcDate.getTime() + hours * 60 * 60 * 1000);
	return getZonedDateTimeParts(adjusted, timeZone);
}
