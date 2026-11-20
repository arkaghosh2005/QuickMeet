/**
 * Creates a silent audio track.
 * Used as a placeholder when the user's microphone is off.
 *
 * IMPORTANT: The oscillator and AudioContext are intentionally kept alive.
 * Stopping/closing them causes the track's readyState to become 'ended',
 * which can corrupt the bundled DTLS transport in WebRTC peer connections
 * and prevent audio from being delivered even on separate audio tracks.
 * Resources are cleaned up when the track is stopped via track.stop().
 */
export const silence = () => {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    const track = Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })

    // Store references on the track to prevent garbage collection and
    // allow cleanup when the track is no longer needed.
    track._audioCtx = ctx
    track._oscillator = oscillator

    // Clean up resources when the track is stopped
    const origStop = track.stop?.bind(track)
    track.stop = () => {
        oscillator.stop()
        ctx.close().catch(() => { })
        if (origStop) origStop()
    }

    return track
}

/**
 * Creates a black video track (blank canvas).
 * Used as a placeholder when the user's camera is off.
 *
 * IMPORTANT: The canvas and stream references are stored on the track to
 * prevent garbage collection. If the canvas is GC'd, the captureStream
 * track's readyState becomes 'ended', which corrupts the WebRTC DTLS
 * transport and breaks audio delivery for other tracks on the same
 * peer connection.
 */
export const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height })
    canvas.getContext('2d').fillRect(0, 0, width, height)
    const stream = canvas.captureStream()
    const track = Object.assign(stream.getVideoTracks()[0], { enabled: false })

    // Store references to prevent GC of canvas and stream
    track._canvas = canvas
    track._stream = stream

    return track
}

