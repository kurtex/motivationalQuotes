import mongoose, { Schema, Types } from "mongoose";

/**
 * Interface representing a User document in the database.
 *
 * @interface IUser
 * @extends Document
 * @property {string} meta_user_id - The user id on Meta
 * @property {Types.ObjectId} active_prompt - Reference to the active Prompt
 */
export interface IUser extends Document {
	/** Additional metadata identifier for the user on Meta */
	meta_user_id: string;
	active_prompt?: Types.ObjectId;
}

/**
 * Mongoose schema definition for the User model.
 *
 * @type {Schema}
 * @property {string} meta_user_id - Required string identifier for Meta
 * @property {Schema.Types.ObjectId} active_prompt - Optional reference to the active Prompt
 */
const UserSchema: Schema = new Schema({
	meta_user_id: { type: String, required: false },
	active_prompt: { type: Schema.Types.ObjectId, ref: "Prompt", required: false },
});

/**
 * Mongoose model for User documents.
 *
 * @type {Model<IUser>}
 * @description Creates a new User model if it doesn't exist, otherwise returns the existing model
 */
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
