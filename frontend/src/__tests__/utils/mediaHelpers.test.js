import { describe, it, expect } from 'vitest';
import { silence, black } from '../../utils/mediaHelpers';

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

