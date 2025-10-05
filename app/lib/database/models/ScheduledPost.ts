import mongoose, { Schema, Document } from "mongoose";

export interface IScheduledPost extends Document {
    userId: mongoose.Types.ObjectId; // Reference to the User model
    scheduleType: 'daily' | 'weekly' | 'monthly' | 'custom'; // Type of recurrence
    intervalValue?: number; // e.g., 2 for every 2 days (if custom)
    intervalUnit?: 'hours' | 'days' | 'weeks'; // e.g., 'days' (if custom)
    timeOfDay: string; // HH:MM format for daily/weekly/custom posts
    timeZoneId: string; // IANA timezone identifier
    lastPostedAt?: Date; // Timestamp of the last successful post
    nextScheduledAt: Date; // Calculated next time this post should occur
    status: 'active' | 'paused' | 'error'; // Status of the recurring schedule
    createdAt: Date;
    updatedAt: Date;
}

const ScheduledPostSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleType: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'], required: true },
    intervalValue: { type: Number },
    intervalUnit: { type: String, enum: ['hours', 'days', 'weeks'] },
    timeOfDay: { type: String, required: true }, // Stored as "HH:MM"
    timeZoneId: { type: String, required: true, default: 'UTC' },
    lastPostedAt: { type: Date },
    nextScheduledAt: { type: Date, required: true, index: true }, // Index for efficient querying
    status: { type: String, enum: ['active', 'paused', 'error'], default: 'active' },
}, { timestamps: true });

const ScheduledPost = mongoose.models.ScheduledPost || mongoose.model<IScheduledPost>('ScheduledPost', ScheduledPostSchema);

export default ScheduledPost;
