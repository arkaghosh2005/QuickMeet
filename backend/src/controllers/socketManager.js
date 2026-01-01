import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import { Server } from "socket.io"

let connections = {}
let messages = {}
let roomCleanupTimers = {}

const ROOM_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

// Export function to get all active room codes
export const getActiveRooms = () => {
    const activeRooms = new Set();
    for (const roomUrl of Object.keys(connections)) {
        // Extract meeting code from URL (last segment)
        const parts = roomUrl.split('/');
        const meetingCode = parts[parts.length - 1];
        if (meetingCode) {
            activeRooms.add(meetingCode);
        }
    }
    // Also include rooms that are scheduled for cleanup (still joinable)
    for (const roomUrl of Object.keys(roomCleanupTimers)) {
        const parts = roomUrl.split('/');
        const meetingCode = parts[parts.length - 1];
        if (meetingCode) {
            activeRooms.add(meetingCode);
        }
    }
    return Array.from(activeRooms);
};

export const connectToSocket = (server) => {
    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl) {
        throw new Error("CLIENT_URL environment variable is required!");
    }

    const io = new Server(server, {
        cors: {
            origin: clientUrl.split(",").map(url => url.trim()),
            methods: ["GET", "POST", "DELETE"],
            allowedHeaders: ["Content-Type"],
            credentials: true
        }
    });

    const cleanupRoom = (roomUrl) => {
        if (connections[roomUrl]) {
            delete connections[roomUrl];
        }
        if (messages[roomUrl]) {
            delete messages[roomUrl];
        }
        if (roomCleanupTimers[roomUrl]) {
            clearTimeout(roomCleanupTimers[roomUrl]);
            delete roomCleanupTimers[roomUrl];
        }
    };

    const scheduleRoomCleanup = (roomUrl) => {
        if (roomCleanupTimers[roomUrl]) {
            clearTimeout(roomCleanupTimers[roomUrl]);
        }

        roomCleanupTimers[roomUrl] = setTimeout(() => {
            if (!connections[roomUrl] || connections[roomUrl].length === 0) {
                cleanupRoom(roomUrl);
            }
        }, ROOM_EXPIRY_TIME);
    };

    io.on("connection", (socket) => {
        socket.on("join-call", ({ roomUrl, userName, userRole, video, audio }) => {
            if (!connections[roomUrl]) {
                connections[roomUrl] = [];
            }

            if (roomCleanupTimers[roomUrl]) {
                clearTimeout(roomCleanupTimers[roomUrl]);
                delete roomCleanupTimers[roomUrl];
            }

            connections[roomUrl].push({ socketId: socket.id, userName, userRole, video, audio });

            connections[roomUrl].forEach(user =>
                io.to(user.socketId).emit("user-joined", socket.id, connections[roomUrl])
            );

            messages[roomUrl]?.forEach(msg =>
                io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"])
            );
        });

        socket.on("update-media-state", ({ video, audio }) => {
            for (const [roomKey, roomUsers] of Object.entries(connections)) {
                const user = roomUsers.find(user => user.socketId === socket.id);
                if (!user) continue;

                Object.assign(user, { video, audio });

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
                connections[room].forEach(user =>
                    io.to(user.socketId).emit("user-left", socket.id)
                );

                connections[room] = connections[room].filter(user => user.socketId !== socket.id);

                if (connections[room].length === 0) {
                    scheduleRoomCleanup(room);
                }
            }
        });
    })
    return io;
}