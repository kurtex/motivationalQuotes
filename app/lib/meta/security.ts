import crypto from "crypto";

/**
 * The expected structure of the decoded payload from a Meta signed_request.
 */
export interface SignedRequestPayload {
	algorithm: "HMAC-SHA256";
	issued_at: number;
	user_id: string;
	[key: string]: unknown;
}

/**
 * Decodes a base64url encoded string into a UTF-8 string.
 *
 * @param str The base64url encoded string.
 * @returns The decoded UTF-8 string.
 */
function base64UrlDecode(str: string): string {
	// Convert base64url to standard base64
	const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	// Pad with '=' characters if necessary
	const padding = "=".repeat((4 - (base64.length % 4)) % 4);
	return Buffer.from(base64 + padding, "base64").toString("utf-8");
}

/**
 * Validates a `signed_request` from Meta using the app's secret.
 *
 * The function first splits the request into its signature and payload parts.
 * It then calculates the expected signature by creating an HMAC-SHA256 hash of the
 * payload using the provided `appSecret`. If the calculated signature matches the
 * one from the request, it decodes and returns the payload.
 *
 * @param signedRequest The `signed_request` string (format: "signature.payload").
 * @param appSecret Your application's secret key from the Meta developer dashboard.
 * @returns The decoded payload object if the signature is valid.
 * @throws An `Error` if the format is incorrect, the signature is invalid,
 *         or the algorithm specified in the payload is not 'HMAC-SHA256'.
 *
 * @see https://developers.facebook.com/docs/games/gamesonfacebook/login#parsingsr
 */
export function validateSignedRequest(
	signedRequest: string,
	appSecret: string
): SignedRequestPayload {
	if (!signedRequest || typeof signedRequest !== "string") {
		throw new Error("Invalid signed_request: must be a non-empty string.");
	}

	const [encodedSig, payload] = signedRequest.split(".");

	if (!encodedSig || !payload) {
		throw new Error(
			'Invalid signed_request format: must be "signature.payload".'
		);
	}

	// 1. Verify the signature
	const expectedSig = crypto
		.createHmac("sha256", appSecret)
		.update(payload) // The hash is computed on the base64url-encoded payload
		.digest("base64url");

	if (encodedSig !== expectedSig) {
		throw new Error(
			"Invalid signature: The provided signature does not match the expected signature."
		);
	}

	// 2. Decode the payload and verify the algorithm
	const decodedPayload: SignedRequestPayload = JSON.parse(
		base64UrlDecode(payload)
	);

	if (decodedPayload.algorithm?.toUpperCase() !== "HMAC-SHA256") {
		throw new Error(
			`Unsupported algorithm: ${decodedPayload.algorithm}. Expected HMAC-SHA256.`
		);
	}

	return decodedPayload;
}
