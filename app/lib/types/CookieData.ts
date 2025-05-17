/**
 * Type definition for the cookie data.
 */
export interface CookieData {
	name: string;
	value: string;
	httpOnly?: boolean;
	secure?: boolean;
	path?: string;
}
