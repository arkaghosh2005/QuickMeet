import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff, Settings, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

const PreCallPage = () => {
    const { meetingCode } = useParams();
    const { userData } = useAuth();
    const navigate = useNavigate();
    let localVideoref = useRef();

    // User Identity
    const [displayName, setDisplayName] = useState(userData?.name || "");

    // Device Permissions
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);

    // User Toggles
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);

    useEffect(() => {
        getPermissions();
    }, []);

    useEffect(() => {
        // Push a new history state
        window.history.pushState(null, "", window.location.href);
        const blockNavigation = () => {
            window.history.pushState(null, "", window.location.href);
        };
        window.addEventListener("popstate", blockNavigation);
        return () => {
            window.removeEventListener("popstate", blockNavigation);
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

    const getPermissions = async () => {
        // If browser lacks support, disable everything immediately
        if (!navigator.mediaDevices?.getUserMedia) {
            console.warn("Media devices not supported.");
            setVideoAvailable(false);
            setAudioAvailable(false);
            setVideo(false);
            setAudio(false);
            return;
        }

        // CAMERA permission
        try {
            const cam = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoAvailable(true);
            cam.getTracks().forEach(track => track.stop());
        } catch (error) {
            setVideoAvailable(false);
            setVideo(false);
        }

        // MICROPHONE permission
        try {
            const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioAvailable(true);
            mic.getTracks().forEach(track => track.stop());
        } catch (error) {
            setAudioAvailable(false);
            setAudio(false);
        }

        // Create an initial preview stream only if at least one device is available
        if (videoAvailable || audioAvailable) {
            try {
                const preview = await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable,
                    audio: audioAvailable,
                });
                window.localStream = preview;
                if (localVideoref.current?.srcObject !== undefined) {
                    try { localVideoref.current.srcObject = preview; } catch (e) { console.warn("Preview assign failed:", e); }
                }
            } catch (e) {
                console.warn("Initial preview getUserMedia failed:", e);
            }
        } else {
            console.warn("No camera or microphone permissions available.");
        }
    };

    let getUserMedia = () => {
        const wantVideo = !!(video && videoAvailable);
        const wantAudio = !!(audio && audioAvailable);

        if (!wantVideo && !wantAudio) {
            // completely stop preview when both toggles off
            try {
                const src = localVideoref.current?.srcObject;
                if (src?.getTracks) src.getTracks().forEach(track => track.stop());
            } catch (e) { console.warn("stop preview failed:", e); }
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            console.warn("getUserMedia not supported.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: wantVideo, audio: wantAudio })
            .then(getUserMediaSuccess)
            .catch(e => {
                console.warn("getUserMedia request failed:", e);
                // if request fails due to permission, update availability
                if (wantVideo) { setVideoAvailable(false); setVideo(false); }
                if (wantAudio) { setAudioAvailable(false); setAudio(false); }
            });
    };

    let getUserMediaSuccess = (userStream) => {
        // stop previous global stream safely
        try {
            if (window.localStream?.getTracks) window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.warn(e); }

        // set new stream and show in preview
        window.localStream = userStream;
        if (localVideoref.current?.srcObject !== undefined) {
            try { localVideoref.current.srcObject = userStream; } catch (e) { console.warn("assign user stream failed:", e); }
        }

        // when any track ends -> fallback
        userStream.getTracks().forEach(track => {
            track.onended = () => {
                setVideo(false);
                setAudio(false);

                try {
                    const previewSrc = localVideoref.current?.srcObject;
                    if (previewSrc?.getTracks) previewSrc.getTracks().forEach(tr => tr.stop());
                } catch (e) { console.warn(e); }

                const fallback = new MediaStream([black(), silence()]);
                window.localStream = fallback;
                if (localVideoref.current?.srcObject !== undefined) {
                    try { localVideoref.current.srcObject = fallback; } catch (e) { console.warn("assign fallback failed:", e); }
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
        // Stop preview stream before navigating
        try {
            if (window.localStream?.getTracks) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) {
            console.warn("Failed to stop preview stream:", e);
        }

        // Check if this user created the meeting
        const isHost = sessionStorage.getItem(`created_${meetingCode}`) === 'true';

        // Clear the flag after checking
        if (isHost) {
            sessionStorage.removeItem(`created_${meetingCode}`);
        }

        // Navigate to call page with initial settings
        navigate(`/${meetingCode}`, {
            state: {
                displayName: displayName,
                video: video,
                audio: audio,
                isHost: isHost,
            }
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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <Button
                        variant="ghost"
                        onClick={() => window.location.href = "/meeting-entry"}
                        className="absolute top-4 left-4 text-white hover:bg-gray-800"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Ready to join?</h1>
                    <p className="text-gray-300">
                        Meeting Code:{" "}
                        <span className="font-mono text-blue-400">{meetingCode}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Video Preview */}
                    <div className="lg:col-span-2">
                        <div className="relative bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px]">
                            {video ? (
                                <video
                                    ref={localVideoref}
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{ transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)" }}
                                    className="w-full h-full object-contain"
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
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                                <Button
                                    onClick={toggleVideo}
                                    variant={video ? "ghost" : "danger"}
                                    className={`rounded-full p-3 ${video ? "bg-gray-700 hover:bg-gray-600" : ""
                                        }`}
                                >
                                    {video ? (
                                        <Video className="w-5 h-5 text-white" />
                                    ) : (
                                        <VideoOff className="w-5 h-5" />
                                    )}
                                </Button>
                                <Button
                                    onClick={toggleAudio}
                                    variant={audio ? "ghost" : "danger"}
                                    className={`rounded-full p-3 ${audio ? "bg-gray-700 hover:bg-gray-600" : ""
                                        }`}
                                >
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
                    <div className="bg-white rounded-2xl p-6">
                        <div className="flex items-center space-x-2 mb-6">
                            <Settings className="w-5 h-5 text-gray-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Setup</h2>
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
                                            size="sm"
                                        >
                                            {video ? "On" : "Off"}
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Microphone</span>
                                        <Button
                                            onClick={toggleAudio}
                                            variant={audio ? "secondary" : "outline"}
                                            size="sm"
                                        >
                                            {audio ? "On" : "Off"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Join Button */}
                            <div className="pt-4 border-t border-gray-200">
                                <Button
                                    onClick={handleJoinCall}
                                    className="w-full"
                                    size="lg"
                                    disabled={!displayName.trim()}
                                >
                                    Join Meeting
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreCallPage;