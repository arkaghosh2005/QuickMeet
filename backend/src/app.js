import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

// Parse CLIENT_URL to support multiple origins (comma-separated) or wildcard
const clientUrl = process.env.CLIENT_URL;
console.log("CLIENT_URL for Express CORS:", clientUrl);

let allowedOrigins;
if (!clientUrl || clientUrl === "*") {
    allowedOrigins = "*";
} else {
    allowedOrigins = clientUrl.split(",").map(url => url.trim());
}

app.set("port", (process.env.PORT));
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use("/v1/users", userRoutes);

const start = async () => {
    app.set("mongo_user")
    const DB = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected`)
    server.listen(app.get("port"), () => {
        console.log(`LISTENIN ON PORT ${app.get("port")}`);
    });
}

start();