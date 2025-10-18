"use server";

import { cookies } from "next/headers";
import { CookieData } from "../../types/CookieData";

/**
 * Creates a cookie with the provided data.
 *
 * @param data - The cookie data to be set.
 */
export async function createCookie(data: CookieData) {
	const cookieStore = await cookies();

	// Set the cookie with the provided data
	cookieStore.set({
		name: data.name,
		value: data.value,
		httpOnly: data.httpOnly,
		secure: data.secure,
		path: data.path,
	});
}

/**
 * Gets a cookie by its name.
 * @param name The name of the cookie to retrieve.
 * @returns The value of the cookie if it exists, otherwise null.
 */
export async function getCookie(name: string) {
	const cookieStore = await cookies();
	const cookie = cookieStore.get(name);

	if (cookie) {
		return cookie.value;
	}

	return null;
}

export async function deleteCookie(name: string) {
	const cookieStore = await cookies();
	cookieStore.delete(name);
}
