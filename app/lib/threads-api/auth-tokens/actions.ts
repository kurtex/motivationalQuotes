import { LongLivedTokenResponse } from "../../types/LongLivedTokenResponse";
import { ShortLivedTokenResponse } from "../../types/ShortLivedTokenResponse";
import apiClient from "../apiClient";
import { EThreadsAuthEndpoints } from "../EThreadsEndpoints";

// Authorization endpoints
export const redirectURI = `${process.env.NEXT_PUBLIC_BASE_URL!}/redirect`;

/**
 * Exhanges the code for a Short-Lived Token from Threads to use for further authentication.
 * This token only lasts for 5 minutes.
 *
 * @param code The code received from the Threads OAuth redirect
 * @returns The short-lived token, if something goes wrong, an error is thrown
 */
export const getShortLivedToken = async (
	code: string
): Promise<ShortLivedTokenResponse> => {
	try {
		const response = await apiClient.post(
			EThreadsAuthEndpoints.SHORT_LIVED_TOKEN,
			null,
			{
				params: {
					client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
					client_secret: process.env.CLIENT_SECRET!,
					code: code,
					grant_type: "authorization_code",
					redirect_uri: redirectURI,
				},
			}
		);

		return response.data as ShortLivedTokenResponse;
	} catch (error) {
		console.error("Error getting short-lived token:", error);
		throw error;
	}
};

/**
 * Exchanges the short-lived token for a Long-Lived Token from Threads to use for further authentication.
 * This token lasts for 60 days.
 *
 * @param shortLivedToken The short-lived token received from the Threads OAuth redirect
 * @returns The long-lived token, if something goes wrong, an error is thrown
 */
export const getLongLivedToken = async (
	shortLivedToken: string
): Promise<LongLivedTokenResponse> => {
	try {
		const response = await apiClient.get(
			EThreadsAuthEndpoints.LONG_LIVED_TOKEN,
			{
				params: {
					client_secret: process.env.CLIENT_SECRET!,
					grant_type: "th_exchange_token",
					access_token: shortLivedToken,
				},
			}
		);

		return response.data as LongLivedTokenResponse;
	} catch (error) {
		console.error("Error getting long-lived token:", error);
		throw error;
	}
};

/**
 * Refreshes a Long-Lived Token from Threads to extend its validity.
 * This token lasts for 60 days after being refreshed.
 *
 * @param longLivedToken The long-lived token that needs to be refreshed
 * @returns The refreshed long-lived token, if something goes wrong, an error is thrown
 */
export const refreshLongLivedToken = async (
	longLivedToken: string
): Promise<LongLivedTokenResponse> => {
	try {
		const response = await apiClient.get(
			EThreadsAuthEndpoints.REFRESH_LONG_LIVE_TOKEN,
			{
				params: {
					grant_type: "th_refresh_token",
					access_token: longLivedToken,
				},
			}
		);

		return response.data as LongLivedTokenResponse;
	} catch (error) {
		console.error("Error refreshing long-lived token:", error);
		throw error;
	}
};
