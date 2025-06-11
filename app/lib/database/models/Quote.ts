import mongoose, { Schema, Types, Document } from "mongoose";

export interface IQuote extends Document {
	text: string;
	hash: string;
	embedding: number[];
	user: Types.ObjectId; // Reference to User
	createdAt: Date;
}

const QuoteSchema = new Schema<IQuote>({
	text: { type: String, required: true },
	hash: { type: String, required: true, index: true },
	embedding: { type: [Number], required: true, index: false },
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	createdAt: { type: Date, default: Date.now },
});

const Quote =
	mongoose.models.Quote || mongoose.model<IQuote>("Quote", QuoteSchema);

export default Quote;
