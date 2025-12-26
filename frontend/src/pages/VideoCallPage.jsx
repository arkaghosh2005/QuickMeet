import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Users, MoreVertical, Monitor, MonitorOff, Copy, Volume2, VolumeX, UserPlus } from "lucide-react";
import Button from "../components/Button";
import ChatPanel from "../components/ChatPanel";
import { useAuth } from "../context/AuthContext";

const server_url = import.meta.env.VITE_SERVER_URL;
var connections = {};
const peerConfigConnections = {
    "iceServers": [
        { "urls": import.meta.env.VITE_STUN_URL_1 },
        { "urls": import.meta.env.VITE_STUN_URL_2 },
        { "urls": import.meta.env.VITE_STUN_URL_3 },
        { "urls": import.meta.env.VITE_STUN_URL_4 },
        { "urls": import.meta.env.VITE_STUN_URL_5 }
    ]
}

const VideoCallPage = () => {
    const { meetingCode } = useParams();
    const { userData } = useAuth();
    const location = useLocation();
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    let screenVideoRef = useRef();

    // Store videos array in a ref for immediate access
    let videosRef = useRef([]);
    let peerCameraTracksRef = useRef({});

    // Store clients data from backend for reference
    let clientsRef = useRef([]);

    // Get initial state from PreCallPage
    const initialState = location.state || {
        displayName: userData?.name || "User",
        video: userData?.video ?? true,
        audio: userData?.audio ?? true,
        isHost: userData?.isHost || false,
    };

    // Device Permissions
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState(true);

    // User Toggles - Use local state, not initialState
    let [video, setVideo] = useState(initialState.video);
    let [audio, setAudio] = useState(initialState.audio);
    let [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    let [screenShare, setScreenShare] = useState(false);

    // UI States and Chat
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    let [showModal, setModal] = useState(false);
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);

    // Remote Participants
    let [videos, setVideos] = useState([]);

    // Screen shares tracking
    let [screenShares, setScreenShares] = useState([]);

    // Real participants data - Dynamically tracked from socket
    const [participants, setParticipants] = useState([]);

    // Block back navigation
    useEffect(() => {
        window.history.pushState(null, "", window.location.href);
        const blockNavigation = () => {
            window.history.pushState(null, "", window.location.href);
        };
        window.addEventListener("popstate", blockNavigation);
        return () => {
            window.removeEventListener("popstate", blockNavigation);
        };
    }, []);

    // Initialize current user as first participant on mount
    useEffect(() => {
        setParticipants([{
            id: socketIdRef.current || "me",
            socketId: socketIdRef.current,
            name: initialState.displayName,
            isHost: initialState.isHost,
            audio: audio,
            video: video,
            isScreenSharing: screenShare,
            isMe: true,
        }]);
    }, []);

    // Update current user's audio/video/screenShare state in participants when toggled
    useEffect(() => {
        setParticipants(prev => prev.map(p =>
            p.isMe ? { ...p, audio: audio, video: video, isScreenSharing: screenShare } : p
        ));
    }, [audio, video, screenShare]);

    // Trigger screen share when screenShare state changes
    useEffect(() => {
        if (screenShare) {
            getDislayMedia();
        }
    }, [screenShare]);

    // Sync remote participants with videos state - preserve backend data
    useEffect(() => {
        setParticipants(prev => {
            const currentUser = prev.find(p => p.isMe);

            // Get remote participants, preserving backend data from clientsRef
            const remoteParticipants = videos.map(v => {
                // First check existing participant data
                const existingParticipant = prev.find(p => p.socketId === v.socketId && !p.isMe);
                // Also check backend clients data
                const backendClient = clientsRef.current.find(c => c.socketId === v.socketId);

                // Check if video track exists and is enabled
                const videoTrack = v.stream?.getVideoTracks()?.[0];
                const hasVideo = videoTrack && videoTrack.enabled && videoTrack.readyState === 'live';

                // Check if this user is screen sharing
                const isScreenSharing = screenShares.some(share => share.socketId === v.socketId);

                return {
                    id: v.socketId,
                    socketId: v.socketId,
                    // Priority: existing > backend > fallback
                    name: existingParticipant?.name || backendClient?.userName || `User ${v.socketId.slice(0, 4)}`,
                    isHost: existingParticipant?.isHost ?? backendClient?.userRole === 'host' ?? false,
                    audio: existingParticipant?.audio ?? backendClient?.audio ?? true,
                    video: hasVideo,
                    isScreenSharing: isScreenSharing,
                    isMe: false,
                };
            });

            return currentUser ? [currentUser, ...remoteParticipants] : remoteParticipants;
        });
    }, [videos, screenShares]);

    // Calculate layout based on screen shares and participants
    const layoutData = useMemo(() => {
        const TOTAL_SLOTS = 8;
        const allScreenShares = [];

        // Collect all screen shares
        if (screenShare) {
            allScreenShares.push({
                id: 'my-screen',
                socketId: socketIdRef.current,
                name: initialState.displayName,
                isMyScreen: true,
            });
        }

        // Add remote screen shares
        screenShares.forEach(share => {
            allScreenShares.push(share);
        });

        const screenShareCount = allScreenShares.length;
        let slotsForScreens = 0;

        // Calculate screen share slots
        if (screenShareCount === 1) {
            slotsForScreens = 6;
        } else if (screenShareCount === 2) {
            slotsForScreens = 6;
        } else if (screenShareCount >= 3) {
            slotsForScreens = screenShareCount;
        }

        const availableParticipantSlots = TOTAL_SLOTS - slotsForScreens;

        // Separate participants by video status
        const currentUser = participants.find(p => p.isMe);
        const remoteParticipants = participants.filter(p => !p.isMe);

        const videoOnParticipants = [
            ...(currentUser ? [currentUser] : []),
            ...remoteParticipants.filter(p => p.video)
        ];
        const videoOffParticipants = remoteParticipants.filter(p => !p.video);

        const visibleVideoOnParticipants = videoOnParticipants;

        const videoOnCount = videoOnParticipants.length;
        const remainingSlotsAfterVideoOn = Math.max(0, availableParticipantSlots - videoOnCount);

        const needsOverflow = videoOffParticipants.length > remainingSlotsAfterVideoOn;
        const videoOffSlotsAvailable = needsOverflow ? remainingSlotsAfterVideoOn - 1 : remainingSlotsAfterVideoOn;

        const visibleVideoOffParticipants = videoOffParticipants.slice(0, Math.max(0, videoOffSlotsAvailable));
        const overflowCount = Math.max(0, videoOffParticipants.length - videoOffSlotsAvailable);

        const totalParticipantCount = participants.length;
        let participantGridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr";

        if (screenShareCount === 0) {
            if (totalParticipantCount === 1) {
                participantGridClass = "grid grid-cols-1 gap-4 h-full";
            } else if (totalParticipantCount === 2) {
                participantGridClass = "grid grid-cols-1 sm:grid-cols-2 gap-4 h-full";
            } else if (totalParticipantCount >= 3 && totalParticipantCount <= 4) {
                participantGridClass = "grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr";
            } else {
                participantGridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr";
            }
        }

        return {
            screenShares: allScreenShares,
            screenShareCount,
            slotsForScreens,
            visibleVideoOnParticipants,
            visibleVideoOffParticipants,
            overflowCount,
            showOverflow: needsOverflow && overflowCount > 0,
            participantGridClass,
            totalParticipantCount,
        };
    }, [screenShare, screenShares, participants, initialState.displayName]);

    // Initialize permissions and socket on mount
    useEffect(() => {
        getPermissions();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let getDislayMedia = () => {
        if (screenShare && navigator.mediaDevices?.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then(getDislayMediaSuccess)
                .catch(err => {
                    setScreenShare(false);
                });
        } else if (screenShare) {
            setScreenShare(false);
        }
    }

    let getDislayMediaSuccess = (displayStream) => {
        try {
            if (window.screenStream?.getTracks) {
                window.screenStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { }

        window.screenStream = displayStream;

        if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = displayStream;
        }

        // Add screen share track to existing connections AND renegotiate
        for (let peerId in connections) {
            if (peerId === socketIdRef.current) continue;
            try {
                const peerConnection = connections[peerId];
                const screenTrack = displayStream.getVideoTracks()[0];

                if (screenTrack) {
                    peerConnection.addTrack(screenTrack, displayStream);

                    peerConnection.createOffer()
                        .then((description) => peerConnection.setLocalDescription(description))
                        .then(() => {
                            socketRef.current.emit('signal', peerId, JSON.stringify({ 'sdp': peerConnection.localDescription }));
                        })
                        .catch(e => { });
                }
            } catch (e) { }
        }

        // Notify other participants
        if (socketRef.current) {
            socketRef.current.emit('screen-share-started', initialState.displayName);
        }

        displayStream.getTracks().forEach(track => {
            track.onended = () => {
                setScreenShare(false);
                window.screenStream = null;
                if (socketRef.current) {
                    socketRef.current.emit('screen-share-stopped');
                }
            };
        });
    };

    const getPermissions = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setVideoAvailable(false);
            setAudioAvailable(false);
            setVideo(false);
            setAudio(false);
            setScreenAvailable(false);
            return;
        }

        let videoOk = false;
        let audioOk = false;

        try {
            const cam = await navigator.mediaDevices.getUserMedia({ video: true });
            videoOk = true;
            setVideoAvailable(true);
            cam.getTracks().forEach(track => track.stop());
        } catch (error) {
            setVideoAvailable(false);
            setVideo(false);
        }

        try {
            const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioOk = true;
            setAudioAvailable(true);
            mic.getTracks().forEach(track => track.stop());
        } catch (error) {
            setAudioAvailable(false);
            setAudio(false);
        }

        setScreenAvailable(!!navigator.mediaDevices?.getDisplayMedia);

        // Get initial stream if any device is available
        if (videoOk || audioOk) {
            try {
                const preview = await navigator.mediaDevices.getUserMedia({
                    video: videoOk && video,
                    audio: audioOk && audio,
                });
                window.localStream = preview;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = preview;
                }
            } catch (e) { }
        }

        connectToSocketServer();
    };

    let getUserMedia = () => {
        const wantVideo = !!(video && videoAvailable);
        const wantAudio = !!(audio && audioAvailable);

        if (!wantVideo && !wantAudio) {
            if (window.localStream) {
                window.localStream.getVideoTracks().forEach(track => track.enabled = false);
                window.localStream.getAudioTracks().forEach(track => track.enabled = false);
            }
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: wantVideo, audio: wantAudio })
            .then(getUserMediaSuccess)
            .catch(e => {
                if (wantVideo) { setVideoAvailable(false); setVideo(false); }
                if (wantAudio) { setAudioAvailable(false); setAudio(false); }
            });
    };

    let getUserMediaSuccess = (userStream) => {
        try {
            if (window.localStream?.getTracks) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { }

        window.localStream = userStream;
        if (localVideoref.current) {
            localVideoref.current.srcObject = userStream;
        }

        // Replace tracks in existing peer connections
        for (let peerId in connections) {
            if (peerId === socketIdRef.current) continue;
            try {
                const peerConnection = connections[peerId];
                const senders = peerConnection.getSenders();

                const videoSender = senders.find(sender =>
                    sender.track?.kind === 'video' &&
                    sender.track !== window.screenStream?.getVideoTracks()[0]
                );
                const videoTrack = userStream.getVideoTracks()[0];
                if (videoSender && videoTrack) {
                    videoSender.replaceTrack(videoTrack).catch(e => { });
                }

                const audioSender = senders.find(sender => sender.track?.kind === 'audio');
                const audioTrack = userStream.getAudioTracks()[0];
                if (audioSender && audioTrack) {
                    audioSender.replaceTrack(audioTrack).catch(e => { });
                }
            } catch (e) { }
        }

        userStream.getTracks().forEach(track => {
            track.onended = () => {
                setVideo(false);
                setAudio(false);
            };
        });
    };

    // Re-get user media when video/audio toggles
    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio]);

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)
        if (fromId !== socketIdRef.current) {
            if (!connections[fromId]) {
                return;
            }

            const peerConnection = connections[fromId];

            if (signal.sdp) {
                const currentState = peerConnection.signalingState;

                if (signal.sdp.type === 'offer') {
                    if (currentState === 'stable' || currentState === 'have-remote-offer') {
                        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                            .then(() => peerConnection.createAnswer())
                            .then((description) => peerConnection.setLocalDescription(description))
                            .then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': peerConnection.localDescription }))
                            })
                            .catch(e => { });
                    }
                }
                else if (signal.sdp.type === 'answer') {
                    if (currentState === 'have-local-offer') {
                        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                            .catch(e => { });
                    }
                }
            }

            if (signal.ice) {
                peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice))
                    .catch(e => { });
            }
        }
    }

    let connectToSocketServer = () => {
        if (socketRef.current?.connected) {
            return;
        }

        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        socketRef.current = io.connect(server_url, { secure: false })
        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id

            socketRef.current.emit('join-call', {
                roomUrl: window.location.href,
                userName: initialState.displayName,
                userRole: initialState.isHost ? 'host' : 'participant',
                video: video,
                audio: audio,
                timestamp: new Date().toISOString()
            });

            window.mySocket = socketRef.current;

            // Update current user with socket ID
            setParticipants(prev => prev.map(p =>
                p.isMe ? { ...p, id: socketIdRef.current, socketId: socketIdRef.current } : p
            ));

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-started-screen-share', (socketId, sharerName) => {
                setScreenShares(prev => {
                    if (prev.some(s => s.socketId === socketId)) return prev;
                    return [...prev, {
                        id: `screen-${socketId}`,
                        socketId: socketId,
                        name: sharerName,
                        isMyScreen: false,
                        stream: null
                    }];
                });
            });

            socketRef.current.on('user-stopped-screen-share', (socketId) => {
                setScreenShares(prev => prev.filter(s => s.socketId !== socketId));
            });

            socketRef.current.on('user-media-state-changed', (socketId, { video, audio }) => {
                setParticipants(prev => prev.map(p =>
                    p.socketId === socketId ? { ...p, video, audio } : p
                ));

                // Also update clientsRef
                const clientIndex = clientsRef.current.findIndex(c => c.socketId === socketId);
                if (clientIndex !== -1) {
                    clientsRef.current[clientIndex].video = video;
                    clientsRef.current[clientIndex].audio = audio;
                }
            });

            socketRef.current.on('user-left', (id) => {
                setParticipants(prev => prev.filter(p => p.socketId !== id));
                setScreenShares(prev => prev.filter(s => s.socketId !== id));
                setVideos((videos) => {
                    const updatedVideos = videos.filter((video) => video.socketId !== id);
                    videosRef.current = updatedVideos;
                    return updatedVideos;
                });

                // Clean up peerCameraTracksRef
                delete peerCameraTracksRef.current[id];

                // Update clientsRef
                clientsRef.current = clientsRef.current.filter(c => c.socketId !== id);

                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            })

            socketRef.current.on('user-joined', (id, clients) => {
                // Store clients data for reference
                clientsRef.current = clients;

                const socketIds = clients.map(client => client.socketId);

                // Update participants with user info from backend
                setParticipants(prev => {
                    const currentUser = prev.find(p => p.isMe);

                    const allParticipants = clients.map(client => {
                        if (client.socketId === socketIdRef.current) {
                            // Keep current user's local state
                            return currentUser || {
                                id: client.socketId,
                                socketId: client.socketId,
                                name: client.userName,
                                isHost: client.userRole === 'host',
                                audio: audio,
                                video: video,
                                isScreenSharing: screenShare,
                                isMe: true
                            };
                        } else {
                            const existing = prev.find(p => p.socketId === client.socketId);
                            return {
                                id: client.socketId,
                                socketId: client.socketId,
                                name: client.userName,
                                isHost: client.userRole === 'host',
                                audio: client.audio,
                                video: client.video,
                                isScreenSharing: existing?.isScreenSharing || false,
                                isMe: false
                            };
                        }
                    });

                    return allParticipants;
                });

                socketIds.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) {
                        return;
                    }

                    if (connections[socketListId]) {
                        return;
                    }

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].ontrack = (event) => {
                        if (event.track.kind !== 'video') {
                            return;
                        }

                        const trackLabel = event.track.label.toLowerCase();
                        const labelIndicatesScreen =
                            trackLabel.includes('screen') ||
                            trackLabel.includes('display') ||
                            trackLabel.includes('window') ||
                            trackLabel.includes('monitor') ||
                            event.track.label.startsWith('screen:');

                        const isSecondVideoTrack = peerCameraTracksRef.current[socketListId] !== undefined;
                        const isScreenTrack = labelIndicatesScreen || isSecondVideoTrack;

                        if (isScreenTrack) {
                            const screenStream = new MediaStream([event.track]);
                            const userInfo = clients.find(c => c.socketId === socketListId);
                            const userName = userInfo?.userName || `User ${socketListId.substring(0, 4)}`;

                            setScreenShares(prev => {
                                const existingShare = prev.find(s => s.socketId === socketListId);
                                if (existingShare) {
                                    return prev.map(share =>
                                        share.socketId === socketListId
                                            ? { ...share, stream: screenStream, name: userName }
                                            : share
                                    );
                                } else {
                                    return [...prev, {
                                        id: `screen-${socketListId}`,
                                        socketId: socketListId,
                                        name: userName,
                                        stream: screenStream,
                                    }];
                                }
                            });

                            event.track.onended = () => {
                                setScreenShares(prev => prev.filter(s => s.socketId !== socketListId));
                            };

                        } else {
                            peerCameraTracksRef.current[socketListId] = event.track;

                            let videoExists = videosRef.current.find(video => video.socketId === socketListId);

                            if (videoExists) {
                                setVideos(videos => {
                                    const updatedVideos = videos.map(video => {
                                        if (video.socketId === socketListId) {
                                            const existingStream = video.stream;
                                            const newStream = new MediaStream();
                                            newStream.addTrack(event.track);

                                            if (existingStream) {
                                                existingStream.getAudioTracks().forEach(track => {
                                                    newStream.addTrack(track);
                                                });
                                            }

                                            return { ...video, stream: newStream };
                                        }
                                        return video;
                                    });
                                    videosRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            } else {
                                let newVideo = {
                                    socketId: socketListId,
                                    stream: new MediaStream([event.track]),
                                    autoplay: true,
                                    playsinline: true
                                };

                                setVideos(videos => {
                                    const updatedVideos = [...videos, newVideo];
                                    videosRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            }
                        }
                    };

                    // Add local stream tracks
                    if (window.localStream) {
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }

                    // Add screen track if sharing
                    if (window.screenStream) {
                        const screenTrack = window.screenStream.getVideoTracks()[0];
                        if (screenTrack) {
                            connections[socketListId].addTrack(screenTrack, window.screenStream);
                        }
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => { })
                        }).catch(e => { })
                    }
                }
            })
        })
    }

    const toggleVideo = () => {
        const newVideo = !video;
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => {
                track.enabled = newVideo;
            });
        }
        setVideo(newVideo);

        if (socketRef.current) {
            socketRef.current.emit('update-media-state', { video: newVideo, audio: audio });
        }
    };

    const toggleAudio = () => {
        const newAudio = !audio;
        if (window.localStream) {
            window.localStream.getAudioTracks().forEach(track => {
                track.enabled = newAudio;
            });
        }
        setAudio(newAudio);

        if (socketRef.current) {
            socketRef.current.emit('update-media-state', { video: video, audio: newAudio });
        }
    };

    const toggleScreenShare = () => {
        if (screenShare) {
            try {
                for (let peerId in connections) {
                    if (peerId === socketIdRef.current) continue;
                    try {
                        const peerConnection = connections[peerId];
                        const senders = peerConnection.getSenders();

                        const screenSender = senders.find(sender =>
                            sender.track?.kind === 'video' &&
                            sender.track === window.screenStream?.getVideoTracks()[0]
                        );

                        if (screenSender) {
                            peerConnection.removeTrack(screenSender);
                        }
                    } catch (e) { }
                }

                window.screenStream?.getTracks()?.forEach(t => t.stop());

                if (screenVideoRef.current?.srcObject) {
                    screenVideoRef.current.srcObject = null;
                }

                window.screenStream = null;
                setScreenShare(false);

                if (socketRef.current) {
                    socketRef.current.emit('screen-share-stopped');
                }
            } catch (e) { }
        } else {
            setScreenShare(true);
        }
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
    };

    const toggleChat = () => {
        setModal(!showModal);
        setIsChatOpen(!isChatOpen);
        if (showModal) {
            setNewMessages(0);
        }
    };

    const toggleParticipants = () => {
        setIsParticipantsOpen(!isParticipantsOpen);
    };

    let handleEndCall = () => {
        try {
            if (window.localStream?.getTracks) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            if (window.screenStream?.getTracks) {
                window.screenStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { }

        for (let id in connections) {
            try {
                connections[id].close();
            } catch (e) { }
        }
        connections = {};

        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        setVideo(false);
        setAudio(false);
        setScreenShare(false);
        setModal(false);
        setIsChatOpen(false);
        setIsParticipantsOpen(false);
        setNewMessages(0);
        setMessages([]);

        window.location.href = "/"
    }

    const addMessage = (data, sender, socketIdSender) => {
        if (socketIdSender === socketIdRef.current) {
            return;
        }
        
        setMessages((prevMessages) => [
            ...prevMessages,
            { 
                id: Date.now().toString() + socketIdSender,
                senderName: sender, 
                message: data,
                timestamp: new Date()
            }
        ]);
        setNewMessages((prevNewMessages) => prevNewMessages + 1);
    };

    const handleSendMessage = (message) => {
        if (socketRef.current && message.trim()) {
            socketRef.current.emit('chat-message', message, initialState.displayName);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now().toString(),
                    senderName: initialState.displayName,
                    message: message,
                    timestamp: new Date()
                }
            ]);
        }
    };

    const copyMeetingCode = () => {
        if (meetingCode) {
            navigator.clipboard.writeText(meetingCode);
            setShowCopiedToast(true);
            setTimeout(() => {
                setShowCopiedToast(false);
            }, 2000);
        }
    };

    const getInitials = (name) => {
        return name?.charAt(0).toUpperCase() || "U";
    };

    const participantCount = participants.length;
    const participantText = participantCount === 1 ? "participant" : "participants";

    const getGridClasses = () => {
        const { screenShareCount, participantGridClass } = layoutData;

        if (screenShareCount >= 1) {
            return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr";
        }
        return participantGridClass;
    };

    const getParticipantSpanClass = () => {
        const { totalParticipantCount, screenShareCount } = layoutData;

        if (screenShareCount > 0) return "";

        if (totalParticipantCount === 1) {
            return "col-span-1 row-span-2";
        }
        return "";
    };

    const getParticipantVideoElement = (participant) => {
        if (participant.isMe) {
            return (
                <video
                    ref={localVideoref}
                    autoPlay
                    muted
                    playsInline
                    style={{
                        transform: "scaleX(-1)",
                        WebkitTransform: "scaleX(-1)",
                    }}
                    className="w-full h-full object-contain bg-black"
                />
            );
        } else {
            const videoData = videos.find(v => v.socketId === participant.socketId);
            if (videoData?.stream) {
                return (
                    <video
                        key={`video-${participant.socketId}`}
                        autoPlay
                        playsInline
                        ref={(videoElement) => {
                            if (videoElement && videoElement.srcObject !== videoData.stream) {
                                videoElement.srcObject = videoData.stream;
                            }
                        }}
                        style={{
                            transform: "scaleX(-1)",
                            WebkitTransform: "scaleX(-1)",
                        }}
                        className="w-full h-full object-contain bg-black"
                    />
                );
            }
        }
        return null;
    };

    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-white font-semibold">Meeting</h1>
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-300 text-sm font-mono">
                            {meetingCode}
                        </span>
                        <Button
                            onClick={copyMeetingCode}
                            variant="ghost"
                            size="sm"
                            className="text-gray-300 hover:text-white hover:bg-blue-600 p-1 transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none !outline-none !ring-0 !ring-offset-0"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm">
                        {participantCount} {participantText}
                    </span>
                    <Button
                        onClick={toggleParticipants}
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white hover:bg-blue-600 p-1 transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none !outline-none !ring-0 !ring-offset-0"
                    >
                        <Users className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            {/* Toast Notification */}
            {showCopiedToast && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center space-x-2 transition-all duration-300 ease-in-out animate-bounce-in">
                    <div className="bg-white rounded-full p-1">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="font-medium">Meeting code copied!</span>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <div className={`flex-1 relative ${isChatOpen ? "md:mr-80" : ""}`}>
                    <div className="h-full p-4 overflow-y-auto">
                        <div className={getGridClasses()}>
                            {/* Render Screen Shares First */}
                            {layoutData.screenShares.map((share, index) => (
                                <div
                                    key={`screen-${share.id}-${index}`}
                                    className={`relative bg-gray-800 rounded-lg overflow-hidden ${layoutData.screenShareCount === 1
                                        ? "lg:col-span-3 lg:row-span-2"
                                        : layoutData.screenShareCount === 2 && index < 2
                                            ? "lg:col-span-3"
                                            : ""
                                        }`}
                                >
                                    {share.isMyScreen ? (
                                        <video
                                            ref={screenVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-contain bg-black"
                                        />
                                    ) : (
                                        <video
                                            autoPlay
                                            playsInline
                                            ref={(videoElement) => {
                                                if (videoElement && share.stream && videoElement.srcObject !== share.stream) {
                                                    videoElement.srcObject = share.stream;
                                                }
                                            }}
                                            className="w-full h-full object-contain bg-black"
                                        />
                                    )}

                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
                                        <Monitor className="w-4 h-4" />
                                        {share.name}'s Screen
                                    </div>
                                </div>
                            ))}

                            {/* Render Video ON Participants */}
                            {layoutData.visibleVideoOnParticipants.map((participant) => (
                                <div
                                    key={`participant-on-${participant.id}`}
                                    className={`relative bg-gray-800 rounded-lg overflow-hidden ${getParticipantSpanClass()}`}
                                >
                                    {participant.video ? (
                                        getParticipantVideoElement(participant)
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                            <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
                                                <span className="text-2xl font-bold text-white">
                                                    {getInitials(participant.name)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                        {participant.name}
                                        {participant.isMe && " (You)"}
                                        {participant.isHost && (
                                            <span className="ml-1 text-xs text-blue-400">
                                                (Host)
                                            </span>
                                        )}
                                    </div>

                                    {!participant.audio && (
                                        <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1.5">
                                            <MicOff className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Render Video OFF Participants */}
                            {layoutData.visibleVideoOffParticipants.map((participant) => (
                                <div
                                    key={`participant-off-${participant.id}`}
                                    className={`relative bg-gray-800 rounded-lg overflow-hidden ${getParticipantSpanClass()}`}
                                >
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                        <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">
                                                {getInitials(participant.name)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                        {participant.name}
                                        {participant.isHost && (
                                            <span className="ml-1 text-xs text-blue-400">
                                                (Host)
                                            </span>
                                        )}
                                    </div>

                                    {!participant.audio && (
                                        <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1.5">
                                            <MicOff className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Overflow Indicator */}
                            {layoutData.showOverflow && (
                                <div
                                    key="overflow-indicator"
                                    onClick={toggleParticipants}
                                    className={`relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors ${getParticipantSpanClass()}`}
                                >
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <UserPlus className="w-12 h-12 text-gray-400 mb-3" />
                                        <span className="text-4xl font-bold text-white mb-2">
                                            +{layoutData.overflowCount}
                                        </span>
                                        <span className="text-sm text-gray-300">
                                            More Participants
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-800 rounded-full px-6 py-3 shadow-2xl z-20">
                        <Button
                            onClick={toggleAudio}
                            variant={audio ? "ghost" : "danger"}
                            className={`rounded-full p-3 ${audio ? "hover:bg-gray-700" : ""}`}
                        >
                            {audio ? (
                                <Mic className="w-5 h-5 text-white" />
                            ) : (
                                <MicOff className="w-5 h-5" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleVideo}
                            variant={video ? "ghost" : "danger"}
                            className={`rounded-full p-3 ${video ? "hover:bg-gray-700" : ""}`}
                        >
                            {video ? (
                                <Video className="w-5 h-5 text-white" />
                            ) : (
                                <VideoOff className="w-5 h-5" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleSpeaker}
                            variant={isSpeakerOn ? "ghost" : "danger"}
                            className="rounded-full p-3 hover:bg-gray-700">
                            {isSpeakerOn ? (
                                <Volume2 className="w-5 h-5 text-white" />
                            ) : (
                                <VolumeX className="w-5 h-5 text-white" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleScreenShare}
                            variant={screenShare ? "danger" : "ghost"}
                            className="rounded-full p-3 hover:bg-gray-700">
                            {screenShare ? (
                                <MonitorOff className="w-5 h-5 text-white" />
                            ) : (
                                <Monitor className="w-5 h-5 text-white" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleChat}
                            variant="ghost"
                            className="rounded-full p-3 hover:bg-gray-700 relative">
                            <MessageSquare className="w-5 h-5 text-white" />
                            {newMessages > 0 && !isChatOpen && (
                                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            className="rounded-full p-3 hover:bg-gray-700">
                            <MoreVertical className="w-5 h-5 text-white" />
                        </Button>

                        <Button
                            onClick={handleEndCall}
                            variant="danger"
                            className="rounded-full p-3">
                            <PhoneOff className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Desktop Chat Panel */}
                {isChatOpen && (
                    <div className="w-80 border-l border-gray-700 hidden md:block">
                        <ChatPanel
                            isOpen={true}
                            onClose={() => setIsChatOpen(false)}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            currentUserName={initialState.displayName}
                        />
                    </div>
                )}
            </div>

            {/* Participants Panel */}
            {isParticipantsOpen && (
                <div className="fixed right-4 top-16 w-64 bg-white rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">
                            Participants ({participantCount})
                        </h3>
                    </div>

                    <div className="p-2">
                        {participants.map((participant) => (
                            <div
                                key={`panel-${participant.id}`}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">
                                        {getInitials(participant.name)}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {participant.name}
                                        {participant.isMe && " (You)"}
                                        {participant.isHost && (
                                            <span className="text-xs text-blue-600 ml-1">
                                                (Host)
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="flex space-x-1">
                                    {!participant.audio && (
                                        <MicOff className="w-4 h-4 text-red-500" />
                                    )}
                                    {!participant.video && (
                                        <VideoOff className="w-4 h-4 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoCallPage;