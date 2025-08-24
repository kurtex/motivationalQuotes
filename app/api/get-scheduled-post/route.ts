import { NextRequest, NextResponse } from "next/server";
import { getScheduledPostForUser } from "@/app/lib/database/actions";
import { getThreadsCookie } from "@/app/lib/threads-api/threads-posts/actions";

export async function GET(req: NextRequest) {
  try {
    const threadsToken = await getThreadsCookie();
    if (!threadsToken) {
      return NextResponse.json({ error: "Unauthorized: No Threads token found" }, { status: 401 });
    }

    const scheduledPost = await getScheduledPostForUser(threadsToken);

    if (scheduledPost) {
      return NextResponse.json({ scheduledPost }, { status: 200 });
    } else {
      return NextResponse.json({ message: "No scheduled post found" }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error fetching scheduled post:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch scheduled post" }, { status: 500 });
  }
}
