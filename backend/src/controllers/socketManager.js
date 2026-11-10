import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import { Server } from "socket.io"
import jwt from "jsonwebtoken"

// Sanitize user input to prevent XSS
const sanitize = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>&"']/g, (c) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
    }[c])).trim().slice(0, 100);
};

let connections = {}
let messages = {}
let roomCleanupTimers = {}
let waitingRoom = {}      // { [roomKey]: [{ socketId, userName, userRole }] }
let roomPasswords = {}    // { [roomKey]: string | null }
let lockedRooms = {}      // { [roomKey]: boolean }

const ROOM_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_MESSAGES_PER_ROOM = 500;

// Export function to get all active room codes
export const getActiveRooms = () => {
    const activeRooms = new Set();
    // Room keys are now plain meeting codes (no URL parsing needed)
    for (const code of Object.keys(connections)) {
        if (code) activeRooms.add(code);
    }
    // Also include rooms that are scheduled for cleanup (still joinable)
    for (const code of Object.keys(roomCleanupTimers)) {
        if (code) activeRooms.add(code);
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
        if (waitingRoom[roomUrl]) delete waitingRoom[roomUrl];
        if (roomPasswords[roomUrl]) delete roomPasswords[roomUrl];
        if (lockedRooms[roomUrl]) delete lockedRooms[roomUrl];
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

    // Socket.io authentication middleware
    // Registered users: verify JWT token
    // Guests: accept name + guestId handshake (no token needed)
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        const guestName = socket.handshake.auth?.guestName;
        const guestId = socket.handshake.auth?.guestId;

        // Path 1: Registered user with JWT
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded;
                return next();
            } catch (err) {
                return next(new Error("Invalid or expired token"));
            }
        }

        // Path 2: Guest with name + guestId
        if (guestName && guestId) {
            socket.user = { name: guestName, id: guestId, isGuest: true };
            return next();
        }

        return next(new Error("Authentication required"));
    });

    io.on("connection", (socket) => {
        // Token-bucket rate limiter per socket
        const rateBucket = { tokens: 20, max: 20, refillRate: 5, lastRefill: Date.now() };
        const consumeToken = () => {
            const now = Date.now();
            const elapsed = (now - rateBucket.lastRefill) / 1000;
            rateBucket.tokens = Math.min(rateBucket.max, rateBucket.tokens + elapsed * rateBucket.refillRate);
            rateBucket.lastRefill = now;
            if (rateBucket.tokens < 1) return false;
            rateBucket.tokens -= 1;
            return true;
        };
        socket.on("join-call", ({ roomUrl, userName, userRole, video, audio }) => {
            userName = sanitize(userName);
            userRole = (userRole === 'host' || userRole === 'participant') ? userRole : 'participant';
            if (!connections[roomUrl]) {
                connections[roomUrl] = [];
            }

            if (roomCleanupTimers[roomUrl]) {
                clearTimeout(roomCleanupTimers[roomUrl]);
                delete roomCleanupTimers[roomUrl];
            }

            // Deduplicate: remove stale entries for the same user
            // (e.g. reconnect with new socket ID before old disconnect fires)
            const userId = socket.user?.id || socket.user?.name;
            connections[roomUrl] = connections[roomUrl].filter(user => {
                if (user.socketId === socket.id) return false;
                if (userId && user._userId === userId) {
                    // Notify others that the old socket left
                    connections[roomUrl].forEach(u =>
                        io.to(u.socketId).emit("user-left", user.socketId)
                    );
                    return false;
                }
                return true;
            });

            connections[roomUrl].push({ socketId: socket.id, userName, userRole, video, audio, _userId: userId });

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
            if (!consumeToken()) return;
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {
            if (!consumeToken()) return;
            data = sanitize(data);
            sender = sanitize(sender);
            const room = Object.keys(connections).find(key =>
                connections[key].some(user => user.socketId === socket.id)
            );
            if (!room) return;

            if (!messages[room]) messages[room] = [];
            messages[room].push({ sender, data, "socket-id-sender": socket.id });
            if (messages[room].length > MAX_MESSAGES_PER_ROOM) messages[room].shift();

            connections[room].forEach(user =>
                io.to(user.socketId).emit("chat-message", data, sender, socket.id)
            );
        });

        socket.on("screen-share-toggle", (isSharing, sharerName) => {
            if (sharerName) sharerName = sanitize(sharerName);
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

        // --- HOST CONTROLS (#34) ---
        socket.on("mute-participant", ({ targetSocketId }) => {
            const room = Object.keys(connections).find(key =>
                connections[key].some(user => user.socketId === socket.id)
            );
            if (!room) return;
            const sender = connections[room].find(u => u.socketId === socket.id);
            if (!sender || sender.userRole !== 'host') return;
            io.to(targetSocketId).emit("force-mute");
        });

        socket.on("kick-participant", ({ targetSocketId }) => {
            const room = Object.keys(connections).find(key =>
                connections[key].some(user => user.socketId === socket.id)
            );
            if (!room) return;
            const sender = connections[room].find(u => u.socketId === socket.id);
            if (!sender || sender.userRole !== 'host') return;
            // Notify the kicked user
            io.to(targetSocketId).emit("force-kick");
            // Remove from room and notify others
            connections[room] = connections[room].filter(u => u.socketId !== targetSocketId);
            connections[room].forEach(u =>
                io.to(u.socketId).emit("user-left", targetSocketId)
            );
        });

        // --- WAITING ROOM (#35) ---
        socket.on("join-waiting-room", ({ roomUrl, userName, userRole, video, audio }) => {
            userName = sanitize(userName);
            if (!waitingRoom[roomUrl]) waitingRoom[roomUrl] = [];
            waitingRoom[roomUrl].push({ socketId: socket.id, userName, userRole, video, audio });
            // Notify host
            const host = connections[roomUrl]?.find(u => u.userRole === 'host');
            if (host) {
                io.to(host.socketId).emit("waiting-room-update", waitingRoom[roomUrl]);
            }
            io.to(socket.id).emit("waiting-room-status", { waiting: true });
        });

        socket.on("admit-user", ({ targetSocketId, roomUrl }) => {
            const room = roomUrl;
            if (!room) return;
            const sender = connections[room]?.find(u => u.socketId === socket.id);
            if (!sender || sender.userRole !== 'host') return;
            // Find user in waiting room
            const waitingIdx = (waitingRoom[room] || []).findIndex(u => u.socketId === targetSocketId);
            if (waitingIdx === -1) return;
            const admitted = waitingRoom[room].splice(waitingIdx, 1)[0];
            // Tell the admitted user to proceed
            io.to(targetSocketId).emit("admitted");
            // Notify host of updated waiting list
            io.to(socket.id).emit("waiting-room-update", waitingRoom[room] || []);
        });

        socket.on("reject-user", ({ targetSocketId, roomUrl }) => {
            const room = roomUrl;
            if (!room) return;
            const sender = connections[room]?.find(u => u.socketId === socket.id);
            if (!sender || sender.userRole !== 'host') return;
            const waitingIdx = (waitingRoom[room] || []).findIndex(u => u.socketId === targetSocketId);
            if (waitingIdx === -1) return;
            waitingRoom[room].splice(waitingIdx, 1);
            io.to(targetSocketId).emit("rejected");
            io.to(socket.id).emit("waiting-room-update", waitingRoom[room] || []);
        });

        // --- MEETING PASSWORD / LOCK (#36) ---
        socket.on("set-room-password", ({ password }) => {
            const room = Object.keys(connections).find(key =>
                connections[key].some(user => user.socketId === socket.id)
            );
            if (!room) return;
            const sender = connections[room].find(u => u.socketId === socket.id);
            if (!sender || sender.userRole !== 'host') return;
            roomPasswords[room] = password || null;
            io.to(socket.id).emit("room-settings-update", {
                hasPassword: !!roomPasswords[room],
                isLocked: !!lockedRooms[room]
            });
        });

        socket.on("toggle-room-lock", () => {
            const room = Object.keys(connections).find(key =>
                connections[key].some(user => user.socketId === socket.id)
            );
            if (!room) return;
            const sender = connections[room].find(u => u.socketId === socket.id);
            if (!sender || sender.userRole !== 'host') return;
            lockedRooms[room] = !lockedRooms[room];
            io.to(socket.id).emit("room-settings-update", {
                hasPassword: !!roomPasswords[room],
                isLocked: !!lockedRooms[room]
            });
        });

        socket.on("check-room-access", ({ roomUrl, password }) => {
            if (lockedRooms[roomUrl]) {
                return io.to(socket.id).emit("room-access-result", { allowed: false, reason: "locked" });
            }
            if (roomPasswords[roomUrl] && roomPasswords[roomUrl] !== password) {
                return io.to(socket.id).emit("room-access-result", { allowed: false, reason: "password" });
            }
            // Check if there's a host and waiting room is needed
            const host = connections[roomUrl]?.find(u => u.userRole === 'host');
            if (host) {
                return io.to(socket.id).emit("room-access-result", { allowed: true, hasWaitingRoom: true });
            }
            io.to(socket.id).emit("room-access-result", { allowed: true, hasWaitingRoom: false });
        });
        // --- DISCONNECT ---
        socket.on("disconnect", () => {
            // Clean up from waiting room if present
            for (const [room, waiting] of Object.entries(waitingRoom)) {
                const idx = waiting.findIndex(u => u.socketId === socket.id);
                if (idx !== -1) {
                    waiting.splice(idx, 1);
                    const host = connections[room]?.find(u => u.userRole === 'host');
                    if (host) {
                        io.to(host.socketId).emit("waiting-room-update", waitingRoom[room] || []);
                    }
                }
            }

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