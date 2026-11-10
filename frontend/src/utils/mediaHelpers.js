/**
 * Creates a silent audio track.
 * Used as a placeholder when the user's microphone is off.
 */
export const silence = () => {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    const track = Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    // Stop oscillator and close AudioContext to prevent resource leaks
    oscillator.stop()
    ctx.close().catch(() => { })
    return track
}

/**
 * Creates a black video track (blank canvas).
 * Used as a placeholder when the user's camera is off.
 */
export const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height })
    canvas.getContext('2d').fillRect(0, 0, width, height)
    const stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
}

