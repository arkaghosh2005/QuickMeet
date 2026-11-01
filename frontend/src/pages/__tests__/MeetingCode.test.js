import { describe, it, expect } from 'vitest';
import { formatMeetingCode } from '../MeetingEntryPage';

// Extract the meeting code generation logic for testing
const generateMeetingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    const randomString = Array.from(bytes, b => chars[b % chars.length]).join('');
    return randomString.slice(0, 3) + '-' + randomString.slice(3, 7) + '-' + randomString.slice(7);
};

describe('Meeting Code Generation', () => {
    it('generates code in correct XXX-XXXX-XXX format', () => {
        const code = generateMeetingCode();
        expect(code).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{3}$/);
    });

    it('always generates exactly 12 chars (including dashes)', () => {
        for (let i = 0; i < 100; i++) {
            const code = generateMeetingCode();
            expect(code.length).toBe(12);
        }
    });

    it('generates unique codes', () => {
        const codes = new Set();
        for (let i = 0; i < 50; i++) {
            codes.add(generateMeetingCode());
        }
        expect(codes.size).toBe(50);
    });
});

describe('formatMeetingCode (Automatic Dash Placement)', () => {
    it('returns empty string for empty input', () => {
        expect(formatMeetingCode('')).toBe('');
        expect(formatMeetingCode(null)).toBe('');
        expect(formatMeetingCode(undefined)).toBe('');
    });

    it('keeps raw alphanumeric characters under 3 without dashes', () => {
        expect(formatMeetingCode('a')).toBe('A');
        expect(formatMeetingCode('ab')).toBe('AB');
        expect(formatMeetingCode('abc')).toBe('ABC');
    });

    it('automatically inserts first dash on 4th character', () => {
        expect(formatMeetingCode('abcd')).toBe('ABC-D');
        expect(formatMeetingCode('abcde')).toBe('ABC-DE');
        expect(formatMeetingCode('abcdefg')).toBe('ABC-DEFG');
    });

    it('automatically inserts second dash on 8th character', () => {
        expect(formatMeetingCode('abcdefgh')).toBe('ABC-DEFG-H');
        expect(formatMeetingCode('abcdefghi')).toBe('ABC-DEFG-HI');
        expect(formatMeetingCode('abcdefghij')).toBe('ABC-DEFG-HIJ');
    });

    it('limits to 10 alphanumeric characters (12 total with dashes)', () => {
        expect(formatMeetingCode('abcdefghijkextra')).toBe('ABC-DEFG-HIJ');
        expect(formatMeetingCode('ABC-DEFG-HIJ-EXTRA')).toBe('ABC-DEFG-HIJ');
    });

    it('handles input that already contains dashes or spaces', () => {
        expect(formatMeetingCode('a-b-c-1-2-3-4-x-y-z')).toBe('ABC-1234-XYZ');
        expect(formatMeetingCode('abc 1234 xyz')).toBe('ABC-1234-XYZ');
    });

    it('handles pasted full meeting URLs', () => {
        expect(formatMeetingCode('https://quickmeet-ag.vercel.app/pre-call/ABC-1234-XYZ')).toBe('ABC-1234-XYZ');
        expect(formatMeetingCode('http://localhost:5173/ABC1234XYZ')).toBe('ABC-1234-XYZ');
    });
});