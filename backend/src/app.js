import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const clientUrl = process.env.CLIENT_URL;

if (!clientUrl) {
    throw new Error("CLIENT_URL environment variable is required!");
}

app.set("port", (process.env.PORT));
app.use(cors({
    origin: clientUrl.split(",").map(url => url.trim()),
    methods: ["GET", "POST", "DELETE"],
    credentials: true
}));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use("/v1/users", userRoutes);

const start = async () => {
    const DB = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected`)
    server.listen(app.get("port"), () => {
        console.log(`LISTENING ON PORT ${app.get("port")}`);
    });
}

start();