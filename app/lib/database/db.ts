import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
	if (isConnected) return;

	try {
		await mongoose.connect(process.env.MONGO_URI!, {
			dbName: "user_tokens",
		});
		isConnected = true;
		console.log("✅ Connected to MongoDB");
	} catch (error) {
		console.error("❌ Error connecting to MongoDB:", error);
	}
};
