export interface LongLivedTokenResponse {
	access_token: string;
	expires_in: number; // number of seconds until expiration
	token_type: string;
}
