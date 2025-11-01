import { NextRequest, NextResponse } from "next/server";
import { validateSignedRequest } from "@/app/lib/meta/security";
import { deleteUserAndAssociatedData } from "@/app/lib/database/actions";
import { connectToDB } from "@/app/lib/database/db";

/**
 * Handles the Data Deletion Callback from Meta.
 * Validates the signed_request and processes the data deletion request.
 *
 * @see https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
export async function POST(request: NextRequest) {
	await connectToDB();
	try {
		const formData = await request.formData();
		const signedRequest = formData.get("signed_request") as string;

		if (!signedRequest) {
			return NextResponse.json(
				{ error: "Missing signed_request" },
				{ status: 400 }
			);
		}

		const appSecret = process.env.CLIENT_SECRET;
		if (!appSecret) {
			return NextResponse.json(
				{ error: "Internal server configuration error." },
				{ status: 500 }
			);
		}

		// 1. Validate the signed request and extract user ID
		const payload = validateSignedRequest(signedRequest, appSecret);
		const userId = payload.user_id;

		// 2. Perform the actual data deletion
		await deleteUserAndAssociatedData(userId);

		// 3. Respond to Meta with a confirmation code
		const confirmationCode = `${userId}_deleted_${Date.now()}`;

		return NextResponse.json(
			{
				status: "success",
				confirmation_code: confirmationCode,
			},
			{ status: 200 }
		);
	} catch (error) {
		const isValidationError =
			error instanceof Error &&
			(error.message.includes("Invalid") ||
				error.message.includes("Unsupported"));

		const errorMessage =
			error instanceof Error ? error.message : "An unknown error occurred";

		if (isValidationError) {
			return NextResponse.json(
				{ error: "Invalid signed_request", details: errorMessage },
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to process request" },
			{ status: 500 }
		);
	}
}
