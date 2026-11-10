import httpStatus from "http-status";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { validationResult } from "express-validator";
import { Meeting } from "../models/meetingModel.js";
import { getActiveRooms } from "./socketManager.js";

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found. Kindly Sign Up First." })
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (isPasswordCorrect) {
            const token = jwt.sign(
                { id: user._id, email: user.email, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.status(httpStatus.OK).json({ token, user: { id: user._id, name: user.name, email: user.email } })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Password. Please Try Again." })
        }

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went Wrong.` })
    }
}

const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "User already exists. Please Login." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(httpStatus.CREATED).json({ message: "User has been Registered. Please Login." })
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went Wrong.` })
    }
}



const getUserHistory = async (req, res) => {
    try {
        const userEmail = req.user.email;

        // Get active rooms from socket manager
        const activeRooms = getActiveRooms();

        // Fetch meetings and add active status (TTL index handles auto-expiry)
        const meetings = await Meeting.find({ user_id: userEmail }).sort({ date: -1 });
        const meetingsWithStatus = meetings.map(meeting => ({
            ...meeting.toObject(),
            isActive: activeRooms.includes(meeting.meetingCode)
        }));

        res.json(meetingsWithStatus);
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
    }
}

const addToHistory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: errors.array()[0].msg });
    }

    const { meeting_code } = req.body;
    try {
        const userEmail = req.user.email;

        await Meeting.findOneAndUpdate(
            { user_id: userEmail, meetingCode: meeting_code },
            { date: new Date() },
            { upsert: true, new: true }
        );

        res.status(httpStatus.CREATED).json({ message: "Meeting added to history" });
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
    }
}

const deleteFromHistory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: errors.array()[0].msg });
    }

    const { meeting_id } = req.body;
    try {
        const userEmail = req.user.email;

        const meeting = await Meeting.findOneAndDelete({
            _id: meeting_id,
            user_id: userEmail
        });

        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Meeting not found" });
        }

        res.status(httpStatus.OK).json({ message: "Meeting deleted from history" });
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
    }
}

const updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: errors.array()[0].msg });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." });
        }

        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Current password is incorrect." });
        }

        // Check if new email is already taken by another user
        if (email !== user.email) {
            const emailTaken = await User.findOne({ email });
            if (emailTaken) {
                return res.status(httpStatus.CONFLICT).json({ message: "Email is already in use by another account." });
            }
        }

        // Update fields
        user.name = name;
        user.email = email;

        // Update password if a new one is provided
        if (newPassword) {
            if (newPassword.length < 8) {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "New password must be at least 8 characters." });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        // Issue a new token with updated info
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(httpStatus.OK).json({
            message: "Profile updated successfully.",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
    }
}

const verifyPassword = async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Password is required." });
    }

    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Incorrect password." });
        }

        res.status(httpStatus.OK).json({ message: "Password verified." });
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
    }
}

const deleteAccount = async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Password is required." });
    }

    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." });
        }

        // Verify password one final time
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Incorrect password." });
        }

        // Delete all meeting history for this user
        await Meeting.deleteMany({ user_id: user.email });

        // Delete the user
        await User.findByIdAndDelete(user._id);

        res.status(httpStatus.OK).json({ message: "Account deleted successfully." });
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
    }
}

export { login, signup, getUserHistory, addToHistory, deleteFromHistory, updateProfile, verifyPassword, deleteAccount };