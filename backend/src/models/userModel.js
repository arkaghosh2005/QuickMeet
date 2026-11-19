import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String },
        googleId: { type: String, sparse: true, unique: true },
        microsoftId: { type: String, sparse: true, unique: true },
        authProvider: { type: String, enum: ["local", "google", "microsoft"], default: "local" }
    }
)

const User = mongoose.model("User", userSchema);
export { User };