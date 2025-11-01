import mongoose from "mongoose";

export const connectToDB = async () => {
	if (mongoose.connection.readyState) return;

	try {
		await mongoose.connect(process.env.MONGO_URI!, {
			dbName: "user_tokens",
		});
	} catch (error) {
		throw error;
	}
};
