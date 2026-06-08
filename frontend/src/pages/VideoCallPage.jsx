import { Video, VideoOff, Mic, Mic2, MicOff, Camera, PhoneOff, MessageSquare, Users, Monitor, MonitorOff, Copy, Volume2, VolumeX, UserPlus, Settings } from "lucide-react";
import Button from "../components/Button";
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import ChatPanel from "../components/ChatPanel";
import SEO from "../components/SEO";
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
    let socketRef = useRef();
    let localVideoRef = useRef();
    let screenVideoRef = useRef();
    let clientsRef = useRef([]);
    let peerCameraTracksRef = useRef({});

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

    // Audio Settings
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [echoCancellation, setEchoCancellation] = useState(true);
    const [autoGainControl, setAutoGainControl] = useState(true);
    const [noiseSuppression, setNoiseSuppression] = useState(false);

    // Device Selection
    const [audioDevices, setAudioDevices] = useState([]);
    const [videoDevices, setVideoDevices] = useState([]);
    const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
    const [selectedVideoDevice, setSelectedVideoDevice] = useState('');

    // UI States and Chat
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    let [messages, setMessages] = useState([]);
    let [newMessages, setNewMessages] = useState(0);

    // Remote Participants and Screen Shares
    let [videos, setVideos] = useState([]);
    let [screenShares, setScreenShares] = useState([]);

    // Real participants data - Dynamically tracked from socket
    const [participants, setParticipants] = useState([]);


    useEffect(() => {
        // Block back navigation
        const blockNav = (e) => {
            e.preventDefault();
            window.history.pushState(null, "", window.location.href);
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", blockNav);

        return () => {
            window.removeEventListener("popstate", blockNav);
        };
    }, []);

    // Update current user's audio/video/screenShare state in participants when toggled
    useEffect(() => {
        // Update participants state
        setParticipants(prev =>
            prev.map(participant => {
                if (!participant.isMe) return participant;
                return { ...participant, audio, video, isScreenSharing: screenShare };
            })
        );

        // Trigger screen share if enabled
        if (screenShare) {
            getDisplayMedia();
        }
    }, [audio, video, screenShare]);

    // Sync remote participants' video and screenShare status with live track data
    useEffect(() => {
        setParticipants(prev =>
            prev.map(participant => {
                if (participant.isMe) return participant;

                // Find matching video stream
                const videoData = videos.find(v => v.socketId === participant.socketId);
                if (!videoData) return participant;

                // Check live video track status
                const videoTrack = videoData.stream?.getVideoTracks()?.[0];
                const hasVideo = videoTrack?.enabled && videoTrack?.readyState === 'live';

                // Check screen share status
                const isScreenSharing = screenShares.some(s => s.socketId === participant.socketId);

                // Only update if changed
                if (participant.video === hasVideo && participant.isScreenSharing === isScreenSharing) {
                    return participant;
                }

                return { ...participant, video: hasVideo, isScreenSharing };
            })
        );
    }, [videos, screenShares]);

    // Calculate layout based on screen shares and participants
    const layoutData = useMemo(() => {
        const TOTAL_SLOTS = 8;

        // Collect all screen shares (local + remote)
        const allScreenShares = [
            ...(screenShare ? [{
                id: 'my-screen',
                socketId: socketRef.current?.id,
                name: initialState.displayName,
                isMyScreen: true,
            }] : []),
            ...screenShares
        ];

        const screenCount = allScreenShares.length;
        const slotsForScreens = screenCount >= 3 ? screenCount : screenCount > 0 ? 6 : 0;
        const availableSlots = TOTAL_SLOTS - slotsForScreens;

        // Split participants: current user first, then video ON, then video OFF
        const currentUser = participants.find(p => p.isMe);
        const remoteWithVideo = participants.filter(p => !p.isMe && p.video);
        const remoteWithoutVideo = participants.filter(p => !p.isMe && !p.video);

        const videoOnParticipants = [...(currentUser ? [currentUser] : []), ...remoteWithVideo];
        const slotsAfterVideoOn = Math.max(0, availableSlots - videoOnParticipants.length);

        const needsOverflow = remoteWithoutVideo.length > slotsAfterVideoOn;
        const videoOffSlots = needsOverflow ? slotsAfterVideoOn - 1 : slotsAfterVideoOn;

        const visibleVideoOff = remoteWithoutVideo.slice(0, Math.max(0, videoOffSlots));
        const overflowCount = remoteWithoutVideo.length - visibleVideoOff.length;

        // Grid class based on participant count (only when no screen shares)
        const count = participants.length;
        let gridClass;

        if (screenCount > 0) {
            gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr";
        } else if (count === 1) {
            gridClass = "grid grid-cols-1 gap-4 h-full";
        } else if (count === 2) {
            gridClass = "grid grid-cols-1 sm:grid-cols-2 gap-4 h-full sm:h-full";
        } else if (count <= 4) {
            // Mobile: stack vertically with min height, Desktop: 2x2 grid
            gridClass = "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:grid-rows-2 sm:h-full";
        } else if (count <= 6) {
            gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:grid-rows-2 sm:h-full";
        } else {
            gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr";
        }

        return {
            screenShares: allScreenShares,
            screenShareCount: screenCount,
            slotsForScreens,
            visibleVideoOnParticipants: videoOnParticipants,
            visibleVideoOffParticipants: visibleVideoOff,
            overflowCount,
            showOverflow: needsOverflow && overflowCount > 0,
            participantGridClass: gridClass,
            totalParticipantCount: count,
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

    // Sync local stream to video element when it becomes available
    useEffect(() => {
        if (localVideoRef.current && window.localStream) {
            if (localVideoRef.current.srcObject !== window.localStream) {
                localVideoRef.current.srcObject = window.localStream;
            }
        }
    }, [participants]);

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

    let getDisplayMedia = () => {
        if (screenShare && navigator.mediaDevices?.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then(getDisplayMediaSuccess)
                .catch(err => {
                    setScreenShare(false);
                });
        } else if (screenShare) {
            setScreenShare(false);
        }
    }

    let getDisplayMediaSuccess = (stream) => {
        // Stop existing & store new
        window.screenStream?.getTracks()?.forEach(t => t.stop());
        window.screenStream = stream;
        if (screenVideoRef.current) screenVideoRef.current.srcObject = stream;

        const screenTrack = stream.getVideoTracks()[0];
        if (!screenTrack) return;

        // Add to all peers & renegotiate
        Object.entries(connections).forEach(([peerId, pc]) => {
            if (peerId === socketRef.current?.id) return;
            try {
                pc.addTrack(screenTrack, stream);
                pc.createOffer()
                    .then(desc => pc.setLocalDescription(desc))
                    .then(() => socketRef.current?.emit('signal', peerId, JSON.stringify({ sdp: pc.localDescription })))
                    .catch(() => { });
            } catch { }
        });

        // Notify server
        socketRef.current?.emit('screen-share-toggle', true, initialState.displayName);

        // Handle stop (via browser UI or track end)
        const onEnded = () => {
            setScreenShare(false);
            window.screenStream = null;
            socketRef.current?.emit('screen-share-toggle', false);
        };
        stream.getTracks().forEach(t => t.onended = onEnded);
    };

    const getPermissions = async () => {
        // Check if mediaDevices API is available
        if (!navigator.mediaDevices?.getUserMedia) {
            setVideoAvailable(false);
            setAudioAvailable(false);
            setVideo(false);
            setAudio(false);
            setScreenAvailable(false);
            return;
        }

        // Helper to check single device permission
        const checkDevice = async (constraint) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraint);
                stream.getTracks().forEach(track => track.stop());
                return true;
            } catch {
                return false;
            }
        };

        // Check video and audio permissions in parallel
        const [videoOk, audioOk] = await Promise.all([
            checkDevice({ video: true }),
            checkDevice({
                audio: {
                    echoCancellation,
                    autoGainControl,
                    noiseSuppression,
                }
            })
        ]);

        // Update availability states
        setVideoAvailable(videoOk);
        setAudioAvailable(audioOk);
        if (!videoOk) setVideo(false);
        if (!audioOk) setAudio(false);
        setScreenAvailable(!!navigator.mediaDevices?.getDisplayMedia);

        // Get initial preview stream if any device is available
        if (videoOk || audioOk) {
            try {
                const preview = await navigator.mediaDevices.getUserMedia({
                    video: videoOk && video,
                    audio: audioOk && audio ? {
                        echoCancellation,
                        autoGainControl,
                        noiseSuppression,
                    } : false,
                });
                window.localStream = preview;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = preview;
                }
            } catch { /* Ignore preview errors */ }
        }

        connectToSocketServer();
    };

    // Enumerate available media devices
    const enumerateDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(d => d.kind === 'audioinput');
            const videoInputs = devices.filter(d => d.kind === 'videoinput');

            setAudioDevices(audioInputs);
            setVideoDevices(videoInputs);

            // Set default selected devices if not already set
            if (!selectedAudioDevice && audioInputs.length > 0) {
                setSelectedAudioDevice(audioInputs[0].deviceId);
            }
            if (!selectedVideoDevice && videoInputs.length > 0) {
                setSelectedVideoDevice(videoInputs[0].deviceId);
            }
        } catch (e) {
            console.warn('Failed to enumerate devices:', e);
        }
    };

    // Enumerate devices when More panel opens
    useEffect(() => {
        if (isMoreOpen) {
            enumerateDevices();
        }
    }, [isMoreOpen]);

    // Handle device change
    const handleAudioDeviceChange = (deviceId) => {
        setSelectedAudioDevice(deviceId);
    };

    const handleVideoDeviceChange = (deviceId) => {
        setSelectedVideoDevice(deviceId);
    };

    let getUserMedia = () => {
        const wantVideo = !!(video && videoAvailable);
        const wantAudio = !!(audio && audioAvailable);

        if (!wantVideo && !wantAudio) {
            window.localStream?.getVideoTracks().forEach(t => t.enabled = false);
            window.localStream?.getAudioTracks().forEach(t => t.enabled = false);
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) return;

        const audioConstraints = wantAudio ? {
            deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
            echoCancellation,
            autoGainControl,
            noiseSuppression,
        } : false;

        const videoConstraints = wantVideo ? {
            deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
        } : false;

        navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: audioConstraints,
        }).then(getUserMediaSuccess)
            .catch(() => {
                if (wantVideo) { setVideoAvailable(false); setVideo(false); }
                if (wantAudio) { setAudioAvailable(false); setAudio(false); }
            });
    };

    let getUserMediaSuccess = (stream) => {
        window.localStream?.getTracks().forEach(t => t.stop());
        window.localStream = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const myId = socketRef.current?.id;
        const screenTrack = window.screenStream?.getVideoTracks()[0];

        // Replace tracks in existing peer connections
        Object.entries(connections).forEach(([peerId, pc]) => {
            if (peerId === myId) return;

            const senders = pc.getSenders();
            const videoTrack = stream.getVideoTracks()[0];
            const audioTrack = stream.getAudioTracks()[0];

            // Replace video track (skip screen share track)
            const videoSender = senders.find(s => s.track?.kind === 'video' && s.track !== screenTrack);
            if (videoSender && videoTrack) videoSender.replaceTrack(videoTrack).catch(() => { });

            // Replace audio track
            const audioSender = senders.find(s => s.track?.kind === 'audio');
            if (audioSender && audioTrack) audioSender.replaceTrack(audioTrack).catch(() => { });
        });

        stream.getTracks().forEach(t => {
            t.onended = () => { setVideo(false); setAudio(false); };
        });
    };

    // Re-get user media when video/audio toggles
    useEffect(() => {
        if (video !== undefined && audio !== undefined) getUserMedia();
    }, [video, audio, echoCancellation, autoGainControl, noiseSuppression, selectedAudioDevice, selectedVideoDevice]);

    let gotMessageFromServer = (fromId, message) => {
        if (fromId === socketRef.current?.id) return;

        const pc = connections[fromId];
        if (!pc) return;

        const signal = JSON.parse(message);

        // Handle SDP (offer/answer)
        if (signal.sdp) {
            const state = pc.signalingState;
            const isOffer = signal.sdp.type === 'offer';
            const isAnswer = signal.sdp.type === 'answer';

            const canHandleOffer = isOffer && (state === 'stable' || state === 'have-remote-offer');
            const canHandleAnswer = isAnswer && state === 'have-local-offer';

            if (canHandleOffer) {
                pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => pc.createAnswer())
                    .then(desc => pc.setLocalDescription(desc))
                    .then(() => socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: pc.localDescription })))
                    .catch(() => { });
            } else if (canHandleAnswer) {
                pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).catch(() => { });
            }
        }

        // Handle ICE candidate
        if (signal.ice) {
            pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(() => { });
        }
    };

    let connectToSocketServer = () => {
        if (socketRef.current?.connected) return;

        socketRef.current?.disconnect();
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            const socket = socketRef.current;
            const myId = socket?.id;

            socket.emit('join-call', {
                roomUrl: window.location.href,
                userName: initialState.displayName,
                userRole: initialState.isHost ? 'host' : 'participant',
                video, audio,
            });

            const token = localStorage.getItem('token');
            if (token && meetingCode) {
                axios.post(`${server_url}/v1/users/history`, {
                    meeting_code: meetingCode
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(err => console.log('Failed to save meeting to history:', err));
            }

            window.mySocket = socket;

            // Update current user with socket ID
            setParticipants(prev => prev.map(p =>
                p.isMe ? { ...p, id: myId, socketId: myId } : p
            ));

            socket.on('chat-message', addMessage);

            socket.on('user-started-screen-share', (socketId, sharerName) => {
                setScreenShares(prev => prev.some(s => s.socketId === socketId) ? prev : [
                    ...prev,
                    { id: `screen-${socketId}`, socketId, name: sharerName, isMyScreen: false, stream: null }
                ]);
            });

            socket.on('user-stopped-screen-share', (socketId) => {
                setScreenShares(prev => prev.filter(s => s.socketId !== socketId));
            });

            socket.on('user-media-state-changed', (socketId, { video, audio }) => {
                setParticipants(prev => prev.map(p =>
                    p.socketId === socketId ? { ...p, video, audio } : p
                ));
                const client = clientsRef.current.find(c => c.socketId === socketId);
                if (client) Object.assign(client, { video, audio });
            });

            socket.on('user-left', (id) => {
                setParticipants(prev => prev.filter(p => p.socketId !== id));
                setScreenShares(prev => prev.filter(s => s.socketId !== id));
                setVideos(prev => prev.filter(v => v.socketId !== id));
                delete peerCameraTracksRef.current[id];
                clientsRef.current = clientsRef.current.filter(c => c.socketId !== id);
                connections[id]?.close();
                delete connections[id];
            });

            socket.on('user-joined', (id, clients) => {
                clientsRef.current = clients;

                // Update participants list
                setParticipants(prev => {
                    const currentUser = prev.find(p => p.isMe);
                    return clients.map(client => {
                        if (client.socketId === myId) {
                            return currentUser || {
                                id: myId, socketId: myId, name: client.userName,
                                isHost: client.userRole === 'host',
                                audio, video, isScreenSharing: screenShare, isMe: true
                            };
                        }
                        const existing = prev.find(p => p.socketId === client.socketId);
                        return {
                            id: client.socketId, socketId: client.socketId, name: client.userName,
                            isHost: client.userRole === 'host', audio: client.audio, video: client.video,
                            isScreenSharing: existing?.isScreenSharing || false, isMe: false
                        };
                    });
                });

                // Setup peer connections for each remote client
                clients.forEach(({ socketId: peerId }) => {
                    if (peerId === myId || connections[peerId]) return;

                    const pc = connections[peerId] = new RTCPeerConnection(peerConfigConnections);

                    pc.onicecandidate = (e) => {
                        if (e.candidate) socket.emit('signal', peerId, JSON.stringify({ ice: e.candidate }));
                    };

                    pc.ontrack = (event) => {
                        const { track } = event;
                        const { kind, label } = track;

                        // Helper to update or create video entry
                        const updateVideos = (newTrack, isAudio = false) => {
                            setVideos(prev => {
                                const existing = prev.find(v => v.socketId === peerId);
                                if (existing) {
                                    const tracks = [...existing.stream.getTracks()];
                                    if (!isAudio) {
                                        // For video: keep existing audio tracks
                                        existing.stream.getAudioTracks().forEach(t => tracks.includes(t) || tracks.push(t));
                                    }
                                    return prev.map(v => v.socketId === peerId
                                        ? { ...v, stream: new MediaStream(isAudio ? [...tracks, newTrack] : [newTrack, ...existing.stream.getAudioTracks()]) }
                                        : v
                                    );
                                }
                                return [...prev, {
                                    socketId: peerId,
                                    stream: new MediaStream([newTrack]),
                                    autoplay: true,
                                    playsinline: true
                                }];
                            });
                        };

                        // Handle AUDIO tracks
                        if (kind === 'audio') {
                            updateVideos(track, true);
                            return;
                        }

                        // Handle VIDEO tracks only
                        if (kind !== 'video') return;

                        const isScreenTrack = ['screen', 'display', 'window', 'monitor']
                            .some(k => label.toLowerCase().includes(k))
                            || label.startsWith('screen:')
                            || peerCameraTracksRef.current[peerId] !== undefined;

                        if (isScreenTrack) {
                            const userName = clients.find(c => c.socketId === peerId)?.userName
                                || `User ${peerId.substring(0, 4)}`;

                            setScreenShares(prev => {
                                const entry = { id: `screen-${peerId}`, socketId: peerId, name: userName, stream: new MediaStream([track]) };
                                const exists = prev.find(s => s.socketId === peerId);
                                return exists
                                    ? prev.map(s => s.socketId === peerId ? { ...s, ...entry } : s)
                                    : [...prev, entry];
                            });

                            track.onended = () => setScreenShares(prev => prev.filter(s => s.socketId !== peerId));
                        } else {
                            peerCameraTracksRef.current[peerId] = track;
                            updateVideos(track);
                        }
                    };

                    // Add local tracks (create black+silence if no stream)
                    if (!window.localStream) {
                        window.localStream = new MediaStream([black(), silence()]);
                    }
                    window.localStream.getTracks().forEach(t => pc.addTrack(t, window.localStream));

                    // Add screen track if sharing
                    const screenTrack = window.screenStream?.getVideoTracks()[0];
                    if (screenTrack) pc.addTrack(screenTrack, window.screenStream);
                });

                // If I just joined, send offers to all peers
                if (id === myId) {
                    Object.entries(connections).forEach(([peerId, pc]) => {
                        if (peerId === myId) return;
                        pc.createOffer()
                            .then(desc => pc.setLocalDescription(desc))
                            .then(() => socket.emit('signal', peerId, JSON.stringify({ sdp: pc.localDescription })))
                            .catch(() => { });
                    });
                }
            });
        });
    };

    const toggleVideo = () => {
        const newVideo = !video;
        window.localStream?.getVideoTracks().forEach(t => t.enabled = newVideo);
        setVideo(newVideo);
        socketRef.current?.emit('update-media-state', { video: newVideo, audio });
    };

    const toggleAudio = () => {
        const newAudio = !audio;
        window.localStream?.getAudioTracks().forEach(t => t.enabled = newAudio);
        setAudio(newAudio);
        socketRef.current?.emit('update-media-state', { video, audio: newAudio });
    };

    const toggleScreenShare = () => {
        if (!screenShare) {
            setScreenShare(true);
            return;
        }

        // Stop sharing - remove screen track from all peers
        const screenTrack = window.screenStream?.getVideoTracks()[0];
        Object.entries(connections).forEach(([peerId, pc]) => {
            if (peerId === socketRef.current?.id) return;
            const sender = pc.getSenders().find(s => s.track === screenTrack);
            if (sender) pc.removeTrack(sender);
        });

        // Cleanup
        window.screenStream?.getTracks().forEach(t => t.stop());
        if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
        window.screenStream = null;
        setScreenShare(false);
        socketRef.current?.emit('screen-share-toggle', false);
    };

    const toggleSpeaker = () => {
        const newSpeakerState = !isSpeakerOn;
        setIsSpeakerOn(newSpeakerState);

        // Mute/unmute all remote video elements
        document.querySelectorAll('video').forEach(video => {
            // Skip local video (which is already muted)
            if (video === localVideoRef.current || video === screenVideoRef.current) return;
            video.muted = !newSpeakerState;
        });
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        if (isChatOpen) {
            setNewMessages(0);
        }
    };

    const toggleParticipants = () => {
        setIsParticipantsOpen(!isParticipantsOpen);
    };

    const toggleMore = () => {
        setIsMoreOpen(!isMoreOpen);
    };

    const handleEndCall = () => {
        // Stop all media tracks
        window.localStream?.getTracks().forEach(t => t.stop());
        window.screenStream?.getTracks().forEach(t => t.stop());

        // Close all peer connections
        Object.values(connections).forEach(pc => pc.close());
        connections = {};

        // Disconnect socket
        socketRef.current?.disconnect();

        // Reset all states
        setVideo(false);
        setAudio(false);
        setScreenShare(false);
        setIsChatOpen(false);
        setIsParticipantsOpen(false);
        setNewMessages(0);
        setMessages([]);

        window.location.href = "/";
    };

    const addMessage = (data, sender, socketIdSender) => {
        if (socketIdSender === socketRef.current?.id) return;
        setMessages(prev => [...prev, {
            id: Date.now() + socketIdSender,
            senderName: sender,
            message: data,
            timestamp: new Date()
        }]);
        setNewMessages(newMessages => newMessages + 1);
    };

    const handleSendMessage = (message) => {
        if (!socketRef.current || !message.trim()) return;
        socketRef.current.emit('chat-message', message, initialState.displayName);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            senderName: initialState.displayName,
            message,
            timestamp: new Date()
        }]);
    };

    const copyMeetingCode = () => {
        if (meetingCode) {
            navigator.clipboard.writeText(meetingCode);
            setShowCopiedToast(true);
            setTimeout(() => setShowCopiedToast(false), 2000);
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
        const { screenShareCount } = layoutData;
        if (screenShareCount > 0) return "";
        return "";
    };

    const getParticipantVideoElement = (participant) => {
        if (participant.isMe) {
            return (
                <video ref={localVideoRef} autoPlay muted playsInline
                    style={{ transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)" }}
                    className="w-full h-full object-contain bg-black"
                />
            );
        }

        const videoData = videos.find(v => v.socketId === participant.socketId);
        if (!videoData?.stream) return null;
        return (
            <video
                key={`video-${participant.socketId}`}
                autoPlay
                playsInline
                muted={!isSpeakerOn}
                ref={(videoElement) => {
                    if (videoElement && videoElement.srcObject !== videoData.stream) {
                        videoElement.srcObject = videoData.stream;
                    }
                }}
                style={{ transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)" }}
                className="w-full h-full object-contain bg-black"
            />
        );
    };

    return (
        <>
        <SEO
            title={`Meeting - ${meetingCode}`}
            description="You're in a QuickMeet video call. Enjoy HD video, screen sharing, and real-time chat."
            path={`/${meetingCode}`}
            noIndex={true}
        />
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
                            variant="primary"
                            size="sm"
                            className="!text-gray-300 !text-white !hover:!bg-blue-600 p-1 transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none !outline-none !ring-0 !ring-offset-0"
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
                        variant="primary"
                        size="sm"
                        className="!text-gray-300 !text-white !hover:!bg-blue-600 p-1 transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none !outline-none !ring-0 !ring-offset-0"
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
                <div className={`flex-1 relative`}>
                    <div className="h-full p-4 pb-20 md:pb-24 overflow-y-auto md:overflow-hidden">
                        <div className={`${getGridClasses()} min-h-full md:h-full`}>
                            {/* Render Screen Shares First */}
                            {layoutData.screenShares.map((share, index) => (
                                <div
                                    key={`screen-${share.id}-${index}`}
                                    className={`relative bg-gray-800 rounded-lg overflow-hidden min-h-[200px] sm:min-h-0 ${layoutData.screenShareCount === 1
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
                                    className={`relative bg-gray-800 rounded-lg overflow-hidden min-h-[200px] sm:min-h-0 ${getParticipantSpanClass()}`}
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
                                    className={`relative bg-gray-800 rounded-lg overflow-hidden min-h-[200px] sm:min-h-0 ${getParticipantSpanClass()}`}
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
                                    className={`relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors min-h-[200px] sm:min-h-0 ${getParticipantSpanClass()}`}
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
                    <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 md:space-x-4 bg-gray-800 rounded-full px-3 py-2 md:px-6 md:py-3 shadow-2xl z-20 max-w-[95vw]">
                        <Button
                            onClick={toggleAudio}
                            variant={audio ? "ghost" : "danger"}
                            className={`rounded-full p-2 md:p-3 ${audio ? "hover:bg-gray-700" : ""}`}
                        >
                            {audio ? (
                                <Mic className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            ) : (
                                <MicOff className="w-4 h-4 md:w-5 md:h-5" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleVideo}
                            variant={video ? "ghost" : "danger"}
                            className={`rounded-full p-2 md:p-3 ${video ? "hover:bg-gray-700" : ""}`}
                        >
                            {video ? (
                                <Video className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            ) : (
                                <VideoOff className="w-4 h-4 md:w-5 md:h-5" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleSpeaker}
                            variant={isSpeakerOn ? "ghost" : "danger"}
                            className="rounded-full p-2 md:p-3 hover:bg-gray-700">
                            {isSpeakerOn ? (
                                <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            ) : (
                                <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleScreenShare}
                            variant={screenShare ? "danger" : "ghost"}
                            className="rounded-full p-2 md:p-3 hover:bg-gray-700 hidden sm:flex">
                            {screenShare ? (
                                <MonitorOff className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            ) : (
                                <Monitor className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleChat}
                            variant={isChatOpen ? "danger" : "ghost"}
                            className="rounded-full p-2 md:p-3 hover:bg-gray-700 relative">
                            <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            {newMessages > 0 && !isChatOpen && (
                                <span className="absolute top-0 right-0 md:top-1 md:right-1 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></span>
                            )}
                        </Button>

                        <Button
                            onClick={toggleMore}
                            variant={isMoreOpen ? "danger" : "ghost"}
                            className="rounded-full p-2 md:p-3 hover:bg-gray-700">
                            <Settings className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </Button>

                        <Button
                            onClick={handleEndCall}
                            variant="danger"
                            className="rounded-full p-2 md:p-3">
                            <PhoneOff className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                    </div>
                </div>

                {/* Floating Chat Panel - Works on both mobile and desktop */}
                {isChatOpen && (
                    <div className="fixed inset-4 md:inset-auto md:right-4 md:bottom-24 md:top-20 md:w-96 z-50 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
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

            {/* More Settings Panel */}
            {isMoreOpen && (
                <div className="fixed left-1/2 transform -translate-x-1/2 bottom-24 md:bottom-28 w-[calc(100%-2rem)] sm:w-80 max-w-sm bg-gray-800 rounded-lg shadow-2xl z-50 border border-gray-700 max-h-[70vh] overflow-y-auto">
                    <div className="p-3 sm:p-4 border-b border-gray-700">
                        <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                            <Settings className="w-4 h-4" />
                            Settings
                        </h3>
                    </div>

                    <div className="p-3 sm:p-4 space-y-4 sm:space-y-5">
                        {/* Device Selection Section */}
                        <div className="space-y-2 sm:space-y-3">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Device Selection</p>

                            {/* Camera Selection */}
                            <div className="space-y-1 sm:space-y-1.5">
                                <label className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
                                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                                    <span className="truncate">Camera</span>
                                </label>
                                <select
                                    value={selectedVideoDevice}
                                    onChange={(e) => handleVideoDeviceChange(e.target.value)}
                                    className="w-full bg-gray-700 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22white%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                                    title={videoDevices.find(d => d.deviceId === selectedVideoDevice)?.label || 'Select camera'}
                                >
                                    {videoDevices.length === 0 ? (
                                        <option value="">No cameras found</option>
                                    ) : (
                                        videoDevices.map((device, index) => {
                                            const label = device.label || `Camera ${index + 1}`;
                                            // Truncate long labels for better display
                                            const displayLabel = label.length > 35 ? label.substring(0, 32) + '...' : label;
                                            return (
                                                <option key={device.deviceId} value={device.deviceId} title={label}>
                                                    {displayLabel}
                                                </option>
                                            );
                                        })
                                    )}
                                </select>
                            </div>

                            {/* Microphone Selection */}
                            <div className="space-y-1 sm:space-y-1.5">
                                <label className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
                                    <Mic2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                                    <span className="truncate">Microphone</span>
                                </label>
                                <select
                                    value={selectedAudioDevice}
                                    onChange={(e) => handleAudioDeviceChange(e.target.value)}
                                    className="w-full bg-gray-700 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22white%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                                    title={audioDevices.find(d => d.deviceId === selectedAudioDevice)?.label || 'Select microphone'}
                                >
                                    {audioDevices.length === 0 ? (
                                        <option value="">No microphones found</option>
                                    ) : (
                                        audioDevices.map((device, index) => {
                                            const label = device.label || `Microphone ${index + 1}`;
                                            // Truncate long labels for better display
                                            const displayLabel = label.length > 35 ? label.substring(0, 32) + '...' : label;
                                            return (
                                                <option key={device.deviceId} value={device.deviceId} title={label}>
                                                    {displayLabel}
                                                </option>
                                            );
                                        })
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-700"></div>

                        {/* Audio Processing Section */}
                        <div className="space-y-2 sm:space-y-3">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Audio Processing</p>

                            {/* Echo Cancellation */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-white truncate">Echo Cancellation</p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">Remove echo from audio</p>
                                </div>
                                <button
                                    onClick={() => setEchoCancellation(!echoCancellation)}
                                    className={`relative w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors flex-shrink-0 ${echoCancellation ? 'bg-blue-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full transition-transform ${echoCancellation ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Auto Gain Control */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-white truncate">Auto Gain Control</p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">Auto-adjust mic volume</p>
                                </div>
                                <button
                                    onClick={() => setAutoGainControl(!autoGainControl)}
                                    className={`relative w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors flex-shrink-0 ${autoGainControl ? 'bg-blue-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full transition-transform ${autoGainControl ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Noise Suppression */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-white truncate">Noise Suppression</p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">Filter background noise</p>
                                </div>
                                <button
                                    onClick={() => setNoiseSuppression(!noiseSuppression)}
                                    className={`relative w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors flex-shrink-0 ${noiseSuppression ? 'bg-blue-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full transition-transform ${noiseSuppression ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default VideoCallPage;