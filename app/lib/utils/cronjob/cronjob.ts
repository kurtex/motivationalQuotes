import { refreshLongLivedToken } from "../../threads-api/auth-tokens/actions";
import TokenModel from "../../database/models/Token";
import { connectToDB } from "../../database/db";
import cron from "node-cron";

// 1 day in seconds
const ONE_DAY_SECONDS = 86400;

// each hour
export const cronjob = cron.schedule("0 * * * *", async () => {
	await connectToDB();
	const tokens = await TokenModel.find();
	const now = Math.floor(Date.now() / 1000);

	for (const token of tokens) {
		const expiresAt = token.last_updated + token.expires_in;
		const remaining = expiresAt - now;

		if (remaining < ONE_DAY_SECONDS) {
			// If less than 1 day remains
			try {
				const response = await refreshLongLivedToken(token.access_token);

				token.access_token = response.access_token;
				token.expires_in = response.expires_in;
				token.last_updated = now;
				await token.save();

				console.log(`🔁 Token for ${token.user_id} refreshed.`);
			} catch (error) {
				console.error(`❌ Error refreshing token for ${token.user_id}:`, error);
			}
		}
	}
});
