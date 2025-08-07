import mongoose, { Schema, Document } from "mongoose";

export interface IPrompt extends Document {
    text: string;
    user: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

const PromptSchema: Schema = new Schema({
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
});

const Prompt = mongoose.models.Prompt || mongoose.model<IPrompt>("Prompt", PromptSchema);

export default Prompt;
