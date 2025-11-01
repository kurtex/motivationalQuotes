import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
	try {
		(await cookies()).delete("threads-token");
		return NextResponse.json(
			{ message: "Logged out successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error logging out:", error);
		return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
	}
}
