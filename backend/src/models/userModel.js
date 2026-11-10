import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true }
    }
)

// Ensure case-insensitive unique index on email
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export { User };