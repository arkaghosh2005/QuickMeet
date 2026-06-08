import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import express from "express";
import { createServer } from "node:http";
import { connectToSocket } from "./controllers/socketManager.js";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);
const clientUrl = process.env.CLIENT_URL;

if (!clientUrl) {
    throw new Error("CLIENT_URL environment variable is required!");
}

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: "Too many attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { message: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.set("port", (process.env.PORT));
app.use(cors({
    origin: clientUrl.split(",").map(url => url.trim()),
    methods: ["GET", "POST", "DELETE"],
    credentials: true
}));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use(helmet());

// Apply rate limiters
app.use(generalLimiter);
app.use("/v1/users/login", authLimiter);
app.use("/v1/users/signup", authLimiter);

app.use("/v1/users", userRoutes);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected`);
        server.listen(app.get("port"), () => {
            console.log(`LISTENING ON PORT ${app.get("port")}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
}

start();

// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        mongoose.disconnect().then(() => {
            console.log("MongoDB disconnected.");
            process.exit(0);
        });
    });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));