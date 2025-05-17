import mongoose, { ObjectId, Schema, Types } from "mongoose";

/**
 * Interface representing a User document in the database.
 *
 * @interface IUser
 * @extends Document
 * @property {ObjectId} user_id - The unique MongoDB ObjectId identifier of the user
 * @property {string} meta_id - The user id on Meta
 */
export interface IUser extends Document {
	/** The unique MongoDB ObjectId identifier of the user */
	user_id: ObjectId;
	/** Additional metadata identifier for the user on Meta */
	meta_id: string;
}

/**
 * Mongoose schema definition for the User model.
 *
 * @type {Schema}
 * @property {ObjectId} user_id - Required unique MongoDB ObjectId
 * @property {string} meta_id - Required string identifier for Meta
 */
const UserSchema: Schema = new Schema({
	user_id: { type: Types.ObjectId, required: true, unique: true },
	meta_id: { type: String, required: false },
});

/**
 * Mongoose model for User documents.
 *
 * @type {Model<IUser>}
 * @description Creates a new User model if it doesn't exist, otherwise returns the existing model
 */
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
