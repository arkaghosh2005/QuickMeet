import httpStatus from "http-status";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import { Meeting } from "../models/meetingModel.js";
import { getActiveRooms } from "./socketManager.js";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Auto-delete meetings older than 30 days
const cleanupOldMeetings = async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS);
        const result = await Meeting.deleteMany({ date: { $lt: thirtyDaysAgo } });
        if (result.deletedCount > 0) {
            console.log(`Auto-deleted ${result.deletedCount} meetings older than 30 days`);
        }
    } catch (e) {
        console.error('Error cleaning up old meetings:', e);
    }
};

// Run cleanup on module load / server start and then every 6 hours
cleanupOldMeetings();
setInterval(cleanupOldMeetings, 6 * 60 * 60 * 1000);

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please Provide Email and Password." })
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found. Kindly Sign Up First." })
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token, user: { name: user.name, email: user.email } })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Password. Please Try Again." })
        }
        
    } catch (e) {
        return res.status(500).json({ message: `Something went Wrong.` })
    }
}

const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists. Please Login." });
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
        res.status(500).json({ message: `Something went Wrong.` })
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;
    try {
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Invalid token. Please login again." });
        }
        
        // Delete meetings older than 30 days for this user
        const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS);
        await Meeting.deleteMany({ user_id: user.email, date: { $lt: thirtyDaysAgo } });
        
        // Get active rooms from socket manager
        const activeRooms = getActiveRooms();
        
        // Fetch meetings and add active status
        const meetings = await Meeting.find({ user_id: user.email }).sort({ date: -1 });
        const meetingsWithStatus = meetings.map(meeting => ({
            ...meeting.toObject(),
            isActive: activeRooms.includes(meeting.meetingCode)
        }));
        
        res.json(meetingsWithStatus);
    } catch (e) {
        res.status(500).json({ message: `Something went Wrong ${e}.` });
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;
    try {
        if (!token || !meeting_code) {
            return res.status(400).json({ message: "Token and meeting code are required" });
        }
        
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Invalid token. Please login again." });
        }

        await Meeting.findOneAndUpdate(
            { user_id: user.email, meetingCode: meeting_code },
            { date: new Date() },
            { upsert: true, new: true }
        );

        res.status(httpStatus.CREATED).json({ message: "Meeting added to history" });
    } catch (e) {
        res.status(500).json({ message: `Something went Wrong ${e}.` });
    }
}

const deleteFromHistory = async (req, res) => {
    const { token, meeting_id } = req.body;
    try {
        if (!token || !meeting_id) {
            return res.status(400).json({ message: "Token and meeting ID are required" });
        }
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Invalid token. Please login again." });
        }
        
        const meeting = await Meeting.findOneAndDelete({ 
            _id: meeting_id, 
            user_id: user.email 
        });
        
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }
        
        res.status(httpStatus.OK).json({ message: "Meeting deleted from history" });
    } catch (e) {
        res.status(500).json({ message: `Something went Wrong ${e}.` });
    }
}

export { login, signup, getUserHistory, addToHistory, deleteFromHistory };