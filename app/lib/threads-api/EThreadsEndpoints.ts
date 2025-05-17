// Enum with the endpoints for the authentication process
// Object with the endpoints for the authentication process
export enum EThreadsAuthEndpoints {
	// Authorization endpoints
	SHORT_LIVED_TOKEN = "/oauth/access_token",
	LONG_LIVED_TOKEN = "/access_token",
	REFRESH_LONG_LIVE_TOKEN = "/refresh_access_token",
	// User endpoint
	USER_DATA = "/v1.0/me",
	// Post endpoints
	NEW_TEXT_CONTAINER = "/v1.0/me/threads",
	POST_TEXT_CONTAINER = "/v1.0/me/threads_publish",
}
