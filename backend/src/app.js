import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: "../.env" });
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


app.set("port", (process.env.PORT || 3000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    app.set("mongo_user")
    const DB = await mongoose.connect(process.env.MONGO_URL);

    console.log(`MONGO Connected DB`)
    server.listen(app.get("port"), () => {
        console.log(`LISTENIN ON PORT ${app.get("port")}`);
    });



}

start();