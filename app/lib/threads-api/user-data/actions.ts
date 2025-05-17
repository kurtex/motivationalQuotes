import { ThreadsUserDataResponse } from "../../types/ThreadsUserDataResponse";
import apiClient from "../apiClient";
import { EThreadsAuthEndpoints } from "../EThreadsEndpoints";

/**
 * Gets the username of the user associated with the provided access token.
 *
 * @param access_token The access token to be used for the request.
 * @returns The username of the user associated with the access token.
 */
export const getThreadsUsername = async (
	access_token: string
): Promise<string> => {
	try {
		const response = await apiClient.get(EThreadsAuthEndpoints.USER_DATA, {
			params: {
				fields: "username",
				access_token: access_token,
			},
		});

		const userData = response.data as ThreadsUserDataResponse;

		return userData.username;
	} catch (error) {
		console.error("Error fetching user username:", error);
		throw error;
	}
};
