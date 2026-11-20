import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { silence, black } from '../../utils/mediaHelpers';

// Mock AudioContext for jsdom environment
let mockOscillatorStopped;
let mockCtxClosed;
const mockAudioTrack = { kind: 'audio', enabled: false, stop: () => {} };
const mockAudioStream = { getAudioTracks: () => [mockAudioTrack] };
const mockDestination = { stream: mockAudioStream };
const mockMediaStreamDestination = { ...mockDestination, stream: mockAudioStream };

class MockAudioContext {
    createOscillator() {
        return {
            connect: () => mockMediaStreamDestination,
            start: () => {},
            stop: () => { mockOscillatorStopped = true; },
        };
    }
    createMediaStreamDestination() {
        return mockMediaStreamDestination;
    }
    resume() {}
    close() { mockCtxClosed = true; return Promise.resolve(); }
}

// Mock canvas captureStream for jsdom environment
const mockVideoTrack = { kind: 'video', enabled: false, stop: () => {} };
const mockVideoStream = { getVideoTracks: () => [mockVideoTrack] };

let originalAudioContext;
let originalGetContext;
let originalCaptureStream;

beforeAll(() => {
    // Save originals
    originalAudioContext = globalThis.AudioContext;
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalCaptureStream = HTMLCanvasElement.prototype.captureStream;

    // Mock AudioContext
    globalThis.AudioContext = MockAudioContext;

    // Mock canvas getContext('2d')
    HTMLCanvasElement.prototype.getContext = function (type) {
        if (type === '2d') {
            return { fillRect: () => {} };
        }
        return null;
    };

    // Mock canvas captureStream
    HTMLCanvasElement.prototype.captureStream = function () {
        return mockVideoStream;
    };
});

afterAll(() => {
    // Restore originals
    globalThis.AudioContext = originalAudioContext;
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    if (originalCaptureStream) {
        HTMLCanvasElement.prototype.captureStream = originalCaptureStream;
    } else {
        delete HTMLCanvasElement.prototype.captureStream;
    }
});

describe('mediaHelpers', () => {
    describe('silence()', () => {
        it('returns a MediaStreamTrack', () => {
            const track = silence();
            expect(track).toBeDefined();
            expect(track.kind).toBe('audio');
            expect(track.enabled).toBe(false);
        });

        it('keeps oscillator and AudioContext alive (track stays live)', () => {
            mockOscillatorStopped = false;
            mockCtxClosed = false;
            const track = silence();
            // oscillator and ctx should NOT be stopped/closed on creation
            expect(mockOscillatorStopped).toBe(false);
            expect(mockCtxClosed).toBe(false);
            // Store references on track to prevent GC
            expect(track._audioCtx).toBeDefined();
            expect(track._oscillator).toBeDefined();
        });

        it('cleans up resources when track.stop() is called', () => {
            mockOscillatorStopped = false;
            mockCtxClosed = false;
            const track = silence();
            expect(typeof track.stop).toBe('function');
            track.stop();
            expect(mockOscillatorStopped).toBe(true);
            expect(mockCtxClosed).toBe(true);
        });
    });

    describe('black()', () => {
        it('returns a MediaStreamTrack', () => {
            const track = black();
            expect(track).toBeDefined();
            expect(track.kind).toBe('video');
            expect(track.enabled).toBe(false);
        });

        it('accepts custom dimensions', () => {
            const track = black({ width: 320, height: 240 });
            expect(track).toBeDefined();
            expect(track.kind).toBe('video');
        });

        it('stores canvas and stream references to prevent GC', () => {
            const track = black();
            expect(track._canvas).toBeDefined();
            expect(track._canvas).toBeInstanceOf(HTMLCanvasElement);
            expect(track._stream).toBeDefined();
        });
    });
});
