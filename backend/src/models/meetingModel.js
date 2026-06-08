import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        user_id: { type: String, required: true },
        meetingCode: {
            type: String,
            required: true,
            match: /^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{3}$/
        },
        date: { type: Date, default: Date.now, required: true }
    }
)

// Compound index for fast user history queries
meetingSchema.index({ user_id: 1, meetingCode: 1 });

// TTL index: auto-delete meetings after 30 days
meetingSchema.index({ date: 1 }, { expireAfterSeconds: 2592000 });

const Meeting = mongoose.model("Meeting", meetingSchema);
export { Meeting };