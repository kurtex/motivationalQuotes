import mongoose, { Schema } from "mongoose";

/**
 * Interface representing a User document in the database.
 *
 * @interface IUser
 * @extends Document
 * @property {string} meta_user_id - The user id on Meta
 */
export interface IUser extends Document {
	/** Additional metadata identifier for the user on Meta */
	meta_user_id: string;
}

/**
 * Mongoose schema definition for the User model.
 *
 * @type {Schema}
 * @property {string} meta_user_id - Required string identifier for Meta
 */
const UserSchema: Schema = new Schema({
	meta_user_id: { type: String, required: false },
});

/**
 * Mongoose model for User documents.
 *
 * @type {Model<IUser>}
 * @description Creates a new User model if it doesn't exist, otherwise returns the existing model
 */
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
