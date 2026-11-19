import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { silence, black } from '../../utils/mediaHelpers';

// Mock AudioContext for jsdom environment
const mockAudioTrack = { kind: 'audio', enabled: false, stop: () => {} };
const mockAudioStream = { getAudioTracks: () => [mockAudioTrack] };
const mockDestination = { stream: mockAudioStream };
const mockMediaStreamDestination = { ...mockDestination, stream: mockAudioStream };

class MockAudioContext {
    createOscillator() {
        return {
            connect: () => mockMediaStreamDestination,
            start: () => {},
            stop: () => {},
        };
    }
    createMediaStreamDestination() {
        return mockMediaStreamDestination;
    }
    resume() {}
    close() { return Promise.resolve(); }
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
    });
});
