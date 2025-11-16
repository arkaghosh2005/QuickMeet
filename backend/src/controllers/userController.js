import httpStatus from "http-status";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import { Meeting } from "../models/meetingModel.js";

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
        res.json({ message: `Something went Wrong.` })
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.email })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went Wrong ${e}.` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;
    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.email,
            meetingCode: meeting_code
        })
        await newMeeting.save();
        res.status(httpStatus.CREATED).json({ message: "Meeting added to history" })
    } catch (e) {
        res.json({ message: `Something went Wrong ${e}.` })
    }
}

export { login, signup, getUserHistory, addToHistory }