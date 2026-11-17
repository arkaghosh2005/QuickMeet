import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff, Settings, ArrowRight, ArrowLeft, Lock, Unlock, KeyRound, Loader2 } from "lucide-react";
import io from "socket.io-client";
import Button from "../components/Button";
import Input from "../components/Input";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { silence, black } from "../utils/mediaHelpers";

const server_url = import.meta.env.VITE_SERVER_URL;

const PreCallPage = () => {
    const { meetingCode } = useParams();
    const { userData } = useAuth();
    const navigate = useNavigate();
    const localVideoref = useRef();
    const localStreamRef = useRef(null);
    const isMountedRef = useRef(true);
    const socketRef = useRef(null);
    const statusIntervalRef = useRef(null);

    // User Identity
    const [displayName, setDisplayName] = useState(userData?.name || "");

    // Room status & waiting room
    const [roomStatus, setRoomStatus] = useState(null); // { exists, isLocked, hasPassword, hasHost }
    const [waitingState, setWaitingState] = useState('idle'); // 'idle' | 'waiting' | 'admitted' | 'rejected'
    const [passwordValue, setPasswordValue] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordVerified, setPasswordVerified] = useState(false);

    // Device Permissions
    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [aspectRatio, setAspectRatio] = useState(16 / 9);

    // User Toggles
    const [video, setVideo] = useState(() => {
        const saved = localStorage.getItem('quickmeet_default_video');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [audio, setAudio] = useState(() => {
        const saved = localStorage.getItem('quickmeet_default_audio');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const stopPreviewStream = () => {
        isMountedRef.current = false;
        try {
            if (localStreamRef.current?.getTracks) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        } catch (e) { /* ignore */ }
        localStreamRef.current = null;
        if (localVideoref.current) {
            localVideoref.current.srcObject = null;
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        getPermissions();

        return () => {
            stopPreviewStream();
        };
    }, []);

    // Socket connection for room status & waiting room
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = JSON.parse(localStorage.getItem('userData') || '{}');
        const socketAuth = token
            ? { token }
            : { guestName: savedUser.name, guestId: savedUser.id };

        const socket = io.connect(server_url, {
            secure: window.location.protocol === "https:",
            auth: socketAuth,
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('check-room-status', { roomUrl: meetingCode });

            // Poll room status every 5s
            statusIntervalRef.current = setInterval(() => {
                socket.emit('check-room-status', { roomUrl: meetingCode });
            }, 5000);
        });

        socket.on('room-status', (status) => {
            setRoomStatus(status);
        });

        socket.on('password-result', ({ success }) => {
            if (success) {
                setPasswordVerified(true);
                setPasswordError('');
            } else {
                setPasswordError('Incorrect password');
            }
        });

        socket.on('admitted', () => {
            setWaitingState('admitted');
        });

        socket.on('rejected', () => {
            setWaitingState('rejected');
            setTimeout(() => setWaitingState('idle'), 3000);
        });

        socket.on('room-expired', () => {
            setWaitingState('idle');
            stopPreviewStream();
            if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
            navigate('/meeting-entry', { replace: true });
        });

        return () => {
            if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [meetingCode]);

    // Auto-navigate when admitted
    useEffect(() => {
        if (waitingState === 'admitted') {
            stopPreviewStream();
            if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
            socketRef.current?.removeAllListeners();
            socketRef.current?.disconnect();
            socketRef.current = null;

            const isHost = sessionStorage.getItem(`created_${meetingCode}`) === 'true';
            if (isHost) sessionStorage.removeItem(`created_${meetingCode}`);

            navigate(`/${meetingCode}`, {
                state: {
                    displayName,
                    video,
                    audio,
                    isHost,
                },
            });
        }
    }, [waitingState]);

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

    const getPermissions = async () => {
        // If browser lacks support, disable everything immediately
        if (!navigator.mediaDevices?.getUserMedia) {
            if (import.meta.env.DEV) console.warn("Media devices not supported.");
            setVideoAvailable(false);
            setAudioAvailable(false);
            setVideo(false);
            setAudio(false);
            return;
        }

        // Use local variables to track availability, then update state
        let isVideoAvailable = false;
        let isAudioAvailable = false;

        // CAMERA permission
        try {
            const cam = await navigator.mediaDevices.getUserMedia({ video: true });
            isVideoAvailable = true;
            cam.getTracks().forEach(track => track.stop());
        } catch (error) {
            isVideoAvailable = false;
        }

        // MICROPHONE permission
        try {
            const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
            isAudioAvailable = true;
            mic.getTracks().forEach(track => track.stop());
        } catch (error) {
            isAudioAvailable = false;
        }

        // Update state based on local variables
        setVideoAvailable(isVideoAvailable);
        setAudioAvailable(isAudioAvailable);
        if (!isVideoAvailable) setVideo(false);
        if (!isAudioAvailable) setAudio(false);
    };

    let getUserMedia = () => {
        const wantVideo = !!(video && videoAvailable);
        const wantAudio = !!(audio && audioAvailable);

        if (!wantVideo && !wantAudio) {
            // completely stop preview when both toggles off
            try {
                const src = localVideoref.current?.srcObject;
                if (src?.getTracks) src.getTracks().forEach(track => track.stop());
            } catch (e) { if (import.meta.env.DEV) console.warn("stop preview failed:", e); }
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            if (import.meta.env.DEV) console.warn("getUserMedia not supported.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: wantVideo, audio: wantAudio })
            .then(getUserMediaSuccess)
            .catch(e => {
                if (import.meta.env.DEV) console.warn("getUserMedia request failed:", e);
                // if request fails due to permission, update availability
                if (wantVideo) { setVideoAvailable(false); setVideo(false); }
                if (wantAudio) { setAudioAvailable(false); setAudio(false); }
            });
    };

    let getUserMediaSuccess = (userStream) => {
        if (!isMountedRef.current) {
            userStream.getTracks().forEach(track => track.stop());
            return;
        }

        // stop previous stream safely
        try {
            if (localStreamRef.current?.getTracks) localStreamRef.current.getTracks().forEach(track => track.stop());
        } catch (e) { if (import.meta.env.DEV) console.warn(e); }

        // set new stream and show in preview
        localStreamRef.current = userStream;
        if (localVideoref.current?.srcObject !== undefined) {
            try { localVideoref.current.srcObject = userStream; } catch (e) { if (import.meta.env.DEV) console.warn("assign user stream failed:", e); }
        }

        // when any track ends -> fallback
        userStream.getTracks().forEach(track => {
            track.onended = () => {
                setVideo(false);
                setAudio(false);

                try {
                    const previewSrc = localVideoref.current?.srcObject;
                    if (previewSrc?.getTracks) previewSrc.getTracks().forEach(tr => tr.stop());
                } catch (e) { if (import.meta.env.DEV) console.warn(e); }

                const fallback = new MediaStream([black(), silence()]);
                localStreamRef.current = fallback;
                if (localVideoref.current?.srcObject !== undefined) {
                    try { localVideoref.current.srcObject = fallback; } catch (e) { if (import.meta.env.DEV) console.warn("assign fallback failed:", e); }
                }
            };
        });
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio]);

    // Togglers
    const toggleVideo = () => {
        setVideo(!video);
    };

    const toggleAudio = () => {
        setAudio(!audio);
    };

    const handleJoinCall = () => {
        const isHost = sessionStorage.getItem(`created_${meetingCode}`) === 'true';

        // If host OR no host in room yet → join directly
        if (isHost || !roomStatus?.hasHost) {
            stopPreviewStream();
            if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
            socketRef.current?.removeAllListeners();
            socketRef.current?.disconnect();
            socketRef.current = null;

            if (isHost) sessionStorage.removeItem(`created_${meetingCode}`);

            navigate(`/${meetingCode}`, {
                state: {
                    displayName,
                    video,
                    audio,
                    isHost,
                },
            });
            return;
        }

        // Non-host joining a room with a host → enter waiting room
        setWaitingState('waiting');
        socketRef.current?.emit('join-waiting-room', {
            roomUrl: meetingCode,
            userName: displayName,
            userRole: 'participant',
            video,
            audio,
        });
    };

    const handleVerifyPassword = () => {
        if (!passwordValue.trim()) return;
        socketRef.current?.emit('verify-room-password', {
            roomUrl: meetingCode,
            password: passwordValue.trim(),
        });
    };

    // Miscellaneous Items
    const handleDisplayNameChange = (event) => {
        setDisplayName(event.target.value);
    };

    const getInitials = (name) => {
        return name?.charAt(0).toUpperCase() || "U";
    };

    return (
        <>
            <SEO
                title={`Pre-Call Setup - ${meetingCode}`}
                description="Configure your camera, microphone, and display name before joining your QuickMeet video meeting."
                path={`/pre-call/${meetingCode}`}
                noIndex={true}
            />
            <div className="min-h-[100dvh] bg-gray-900 flex items-center justify-center p-3 sm:p-4">
                <div className="w-full max-w-4xl">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => {
                            stopPreviewStream();
                            navigate("/meeting-entry");
                        }}
                        className="text-white hover:bg-gray-800 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to join?</h1>
                        <p className="text-gray-300">
                            Meeting Code:{" "}
                            <span className="font-mono text-blue-400">{meetingCode}</span>
                        </p>

                        {/* Room Status Badge */}
                        <div className="mt-3 flex justify-center">
                            {!roomStatus ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Checking room...
                                </span>
                            ) : roomStatus.isLocked && !roomStatus.hasPassword && !passwordVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-red-900/50 text-red-300">
                                    <Lock className="w-3.5 h-3.5" />
                                    Meeting Locked
                                </span>
                            ) : roomStatus.isLocked && roomStatus.hasPassword && !passwordVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-yellow-900/50 text-yellow-300">
                                    <KeyRound className="w-3.5 h-3.5" />
                                    Meeting Locked - Enter password to unlock
                                </span>
                            ) : roomStatus.hasPassword && !passwordVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-yellow-900/50 text-yellow-300">
                                    <KeyRound className="w-3.5 h-3.5" />
                                    Password Required
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-green-900/50 text-green-300">
                                    <Unlock className="w-3.5 h-3.5" />
                                    {roomStatus.hasHost ? 'Open' : 'No restrictions'}
                                </span>
                            )}
                        </div>

                        {/* Password Input — shown only when room has a password and not yet verified */}
                        {roomStatus && roomStatus.hasPassword && !passwordVerified && (
                            <div className="mt-4 max-w-xs mx-auto">
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={passwordValue}
                                        onChange={(e) => { setPasswordValue(e.target.value); setPasswordError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                                        placeholder="Enter meeting password"
                                        className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={handleVerifyPassword}
                                        disabled={!passwordValue.trim()}
                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Unlock
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="text-red-400 text-xs mt-1.5">{passwordError}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                        {/* Video Preview */}
                        <div className="lg:col-span-2">
                            <div
                                className="relative bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center"
                                style={{ aspectRatio }}
                            >
                                {video ? (
                                    <video
                                        ref={localVideoref}
                                        autoPlay
                                        muted
                                        playsInline
                                        onLoadedMetadata={(e) => setAspectRatio(e.target.videoWidth / e.target.videoHeight)}
                                        style={{ transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)" }}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">
                                                {getInitials(displayName)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Controls Overlay */}
                                <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 sm:space-x-4">
                                    <Button
                                        onClick={toggleVideo}
                                        variant={video ? "ghost" : "danger"}
                                        className={`rounded-full p-3 ${video ? "bg-gray-700 hover:bg-gray-600" : ""}`}>
                                        {video ? (
                                            <Video className="w-5 h-5 text-white" />
                                        ) : (
                                            <VideoOff className="w-5 h-5" />
                                        )}
                                    </Button>
                                    <Button
                                        onClick={toggleAudio}
                                        variant={audio ? "ghost" : "danger"}
                                        className={`rounded-full p-3 ${audio ? "bg-gray-700 hover:bg-gray-600" : ""}`}>
                                        {audio ? (
                                            <Mic className="w-5 h-5 text-white" />
                                        ) : (
                                            <MicOff className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <Settings className="w-5 h-5 text-gray-600" />
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Setup</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Display Name Input */}
                                <Input
                                    label="Display Name"
                                    placeholder="Enter your name"
                                    value={displayName}
                                    onChange={handleDisplayNameChange}
                                    forceLightMode={true}
                                />

                                {/* Audio & Video Settings */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">Audio & Video</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Camera</span>
                                            <Button
                                                onClick={toggleVideo}
                                                variant={video ? "secondary" : "outline"}
                                                size="sm">
                                                {video ? "On" : "Off"}
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Microphone</span>
                                            <Button
                                                onClick={toggleAudio}
                                                variant={audio ? "secondary" : "outline"}
                                                size="sm">
                                                {audio ? "On" : "Off"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Join Button / Waiting State */}
                                <div className="pt-4 border-t border-gray-200">
                                    {waitingState === 'waiting' ? (
                                        <div className="text-center space-y-3">
                                            <div className="flex items-center justify-center gap-2 text-blue-600">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span className="font-medium text-sm">Waiting for host to let you in...</span>
                                            </div>
                                            <button
                                                onClick={() => setWaitingState('idle')}
                                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : waitingState === 'rejected' ? (
                                        <div className="text-center space-y-2">
                                            <p className="text-red-600 font-medium text-sm">Your request to join was denied</p>
                                            <p className="text-gray-500 text-xs">You can try again</p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleJoinCall}
                                            className="w-full"
                                            size="lg"
                                            disabled={
                                                !displayName.trim() ||
                                                !roomStatus ||
                                                (roomStatus && (roomStatus.isLocked || roomStatus.hasPassword) && !passwordVerified)
                                            }>
                                            Join Meeting
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PreCallPage;