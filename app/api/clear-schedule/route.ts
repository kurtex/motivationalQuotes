import { NextRequest, NextResponse } from "next/server";
import { clearScheduledPostForUser } from "@/app/lib/database/actions";
import { getCookie } from "@/app/lib/utils/cookies/actions";

export async function POST(req: NextRequest) {
	// Using POST for state change
	try {
		const threadsToken = await getCookie("threads-token");
		if (!threadsToken) {
			return NextResponse.json(
				{ error: "Unauthorized: No Threads token found" },
				{ status: 401 }
			);
		}

		const success = await clearScheduledPostForUser(threadsToken);

		if (success) {
			return NextResponse.json(
				{ message: "Schedule cleared successfully" },
				{ status: 200 }
			);
		} else {
			return NextResponse.json(
				{ error: "No active schedule found to clear" },
				{ status: 404 }
			);
		}
	} catch (error: any) {
		console.error("Error clearing schedule:", error);
		return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
	}
}
