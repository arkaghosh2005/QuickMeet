import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import { Server } from "socket.io"
let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl) {
        throw new Error("CLIENT_URL environment variable is required!");
    }

    // Create a new Socket.io server
    const io = new Server(server, {
        cors: {
            origin: clientUrl.split(",").map(url => url.trim()),
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {
        timeOnline[socket.id] = new Date();

        socket.on("join-call", ({ roomUrl, userName, userRole, video, audio }) => {
            if (!connections[roomUrl]) connections[roomUrl] = [];

            connections[roomUrl].push({ socketId: socket.id, userName, userRole, video, audio });

            // Notify all participants (including new user) about the updated list
            connections[roomUrl].forEach(user =>
                io.to(user.socketId).emit("user-joined", socket.id, connections[roomUrl])
            );

            // Send existing chat history to new user
            messages[roomUrl]?.forEach(msg =>
                io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"])
            );
        });

        socket.on("update-media-state", ({ video, audio }) => {
            for (const [roomKey, roomUsers] of Object.entries(connections)) {
                const user = roomUsers.find(user=> user.socketId === socket.id);
                if (!user) continue;

                // Update user's media state
                Object.assign(user, { video, audio });

                // Notify other users in the room
                roomUsers
                    .filter(user => user.socketId !== socket.id)
                    .forEach(user => io.to(user.socketId).emit("user-media-state-changed", socket.id, { video, audio }));

                break;
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {
            const room = Object.keys(connections).find(key =>
                connections[key].some(user => user.socketId === socket.id)
            );
            if (!room) return;

            if (!messages[room]) messages[room] = [];
            messages[room].push({ sender, data, "socket-id-sender": socket.id });

            connections[room].forEach(user =>
                io.to(user.socketId).emit("chat-message", data, sender, socket.id)
            );
        });

        socket.on("screen-share-toggle", (isSharing, sharerName) => {
            const room = Object.keys(connections).find(key =>
                connections[key].some(user => user.socketId === socket.id)
            );
            if (!room) return;

            const event = isSharing ? "user-started-screen-share" : "user-stopped-screen-share";
            const args = isSharing ? [socket.id, sharerName] : [socket.id];

            connections[room]
                .filter(user => user.socketId !== socket.id)
                .forEach(user => io.to(user.socketId).emit(event, ...args));
        });

        socket.on("disconnect", () => {
            const room = Object.keys(connections).find(key =>
                connections[key].some(user => user.socketId === socket.id)
            );

            if (room) {
                // Notify all users in the room
                connections[room].forEach(user =>
                    io.to(user.socketId).emit("user-left", socket.id)
                );

                // Remove disconnected user
                connections[room] = connections[room].filter(user => user.socketId !== socket.id);

                // Cleanup empty room
                if (connections[room].length === 0) {
                    delete connections[room];
                    if (messages[room]) {
                        delete messages[room];
                    }
                }
            }
            delete timeOnline[socket.id];
        });
    })
    return io;
}