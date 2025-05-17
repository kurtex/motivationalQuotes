import { MediaContainerResponse } from "../../types/MediaContainerResponse";
import { getCookie } from "../../utils/cookies/actions";
import apiClient from "../apiClient";
import { EThreadsAuthEndpoints } from "../EThreadsEndpoints";

/**
 * Creates a thread text container for the given Threads user ID.
 *
 * @param threadsUserId The user ID of the Threads user.
 * @param access_token The access token to be used for the request.
 * @param postText The text to be posted in the thread.
 * @returns The ID of the created thread container.
 * @throws An error if something was wrong.
 */
export const createThreadTextContainer = async (
	postText: string,
	access_token: string
) => {
	try {
		const response = await apiClient.post(
			EThreadsAuthEndpoints.NEW_TEXT_CONTAINER,
			null,
			{
				params: {
					text: postText,
					media_type: "text",
					access_token,
				},
			}
		);

		const containerId = response.data as MediaContainerResponse;

		return containerId.id;
	} catch (error) {
		console.error("Error creating thread container:", error);
		throw error;
	}
};

/**
 * Posts a threads text container for the given Threads user ID.
 *
 * @param threadsUserId The user ID of the Threads user.
 * @param containerId The ID of the container to be posted.
 * @throws An error if something was wrong.
 */
export const postThreadsTextContainer = async (
	containerId: string,
	access_token: string
) => {
	try {
		await apiClient.post(EThreadsAuthEndpoints.POST_TEXT_CONTAINER, null, {
			params: {
				creation_id: containerId,
				access_token,
			},
		});
	} catch (error) {
		console.error("Error creating thread post:", error);
		throw error;
	}
};

/**
 * Gets the Threads cookie.
 *
 * @returns The access token for the Threads API.
 * @throws An error if the access token is not found.
 */
async function getThreadsCookie() {
	const access_token = await getCookie("threads-token");
	if (!access_token) {
		throw new Error("Access token is required");
	}
	return access_token;
}
