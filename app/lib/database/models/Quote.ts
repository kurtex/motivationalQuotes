import mongoose, { Schema, Types, Document } from "mongoose";

export interface IQuote extends Document {
	text: string;
	user: Types.ObjectId; // Reference to User
	createdAt: Date;
}

const QuoteSchema = new Schema<IQuote>({
	text: { type: String, required: true },
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	createdAt: { type: Date, default: Date.now },
});

const Quote =
	mongoose.models.Quote || mongoose.model<IQuote>("Quote", QuoteSchema);

export default Quote;
