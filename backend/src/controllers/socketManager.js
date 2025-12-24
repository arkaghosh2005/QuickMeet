import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import { Server } from "socket.io"
let connections = {}
let messages = {}
let timeOnline = {}


export const connectToSocket = (server) => {

    // Create a new Socket.io server (Remove before deployment)
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id)
        timeOnline[socket.id] = new Date();

        socket.on("join-call", (data) => {
            const { roomUrl, userName, userRole, video, audio, timestamp } = data;

            console.log("User joined:", {
                socketId: socket.id,
                name: userName,
                role: userRole,
                av: { video, audio },
                time: timestamp
            });

            const path = roomUrl;

            if (connections[path] === undefined) {
                connections[path] = []
            }

            // Store user info with socket
            connections[path].push({
                socketId: socket.id,
                userName: userName,
                userRole: userRole,
                video: video,
                audio: audio
            });

            const existingParticipants = [...connections[path]];

            console.log(connections)
            // Send user-joined event to all participants including new user
            existingParticipants.forEach((participant) => {
                io.to(participant.socketId).emit("user-joined", socket.id, connections[path]);
            });

            // Send chat history to new user
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }
        })

        // ✅ NEW: Handle audio/video state updates
        socket.on("update-media-state", (data) => {
            const { video, audio } = data;

            // Find user's room and update their state
            for (const [roomKey, roomUsers] of Object.entries(connections)) {
                const userIndex = roomUsers.findIndex(user => user.socketId === socket.id);

                if (userIndex !== -1) {
                    // Update user's media state
                    connections[roomKey][userIndex].video = video;
                    connections[roomKey][userIndex].audio = audio;

                    console.log(`Media state updated for ${socket.id}:`, { video, audio });

                    // Notify all other participants in the room
                    roomUsers.forEach((user) => {
                        if (user.socketId !== socket.id) {
                            io.to(user.socketId).emit("user-media-state-changed", socket.id, { video, audio });
                        }
                    });

                    break;
                }
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.some(user => user.socketId === socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);
            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }
                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                connections[matchingRoom].forEach((user) => {
                    io.to(user.socketId).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        socket.on("screen-share-started", (sharerName) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.some(user => user.socketId === socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                connections[matchingRoom].forEach((user) => {
                    if (user.socketId !== socket.id) {
                        io.to(user.socketId).emit("user-started-screen-share", socket.id, sharerName);
                    }
                });
            }
        });

        socket.on("screen-share-stopped", () => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.some(user => user.socketId === socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                connections[matchingRoom].forEach((user) => {
                    if (user.socketId !== socket.id) {
                        io.to(user.socketId).emit("user-stopped-screen-share", socket.id);
                    }
                });
            }
        });

        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.id}`);
            var diffTime = Math.abs(timeOnline[socket.id] - new Date());
            var key;

            for (const [room, persons] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let person = 0; person < persons.length; ++person) {
                    if (persons[person].socketId === socket.id) {
                        key = room;

                        for (let person = 0; person < connections[key].length; ++person) {
                            io.to(connections[key][person].socketId).emit('user-left', socket.id)
                        }

                        var index = connections[key].findIndex(user => user.socketId === socket.id);
                        connections[key].splice(index, 1);
                        if (connections[key].length === 0) {
                            delete connections[key];
                            if (messages[key]) {
                                delete messages[key];
                                console.log(`🗑️ Messages cleared for room: ${key}`);
                            }
                        }
                    }
                }
            }

            // Clean up timeOnline
            delete timeOnline[socket.id];
        })
    })
    return io;
}