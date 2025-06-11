import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface representing a Threads API token document
 * @interface IToken
 * @extends {Document}
 */
export interface IToken extends Document {
	/** The unique identifier of the user this token belongs to */
	user_id: string;
	/** The actual access token string used for API authentication */
	access_token: string;
	/** Unix timestamp (in seconds) of the last token update or refresh */
	last_updated: number;
	/** Token expiration time in seconds from last_updated */
	expires_in: number;
}

/**
 * Mongoose schema definition for the Token model
 * @type {Schema}
 */
const TokenSchema: Schema = new Schema({
	user_id: { type: String, required: true, unique: true },
	access_token: { type: String, required: true },
	last_updated: { type: Number, required: true },
	expires_in: { type: Number, required: true },
});

/**
 * Mongoose model for Threads API tokens
 * Uses the TokenSchema to define the structure and validation rules.
 * It also ensures that the model is only created once, preventing multiple instances.
 * @type {mongoose.Model<IToken>}
 */
const Token =
	mongoose.models.Token || mongoose.model<IToken>("Token", TokenSchema);

export default Token;
