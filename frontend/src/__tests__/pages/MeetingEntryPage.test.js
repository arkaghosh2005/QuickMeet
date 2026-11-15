import { describe, it, expect } from 'vitest';
import { formatMeetingCode } from '../../pages/MeetingEntryPage';

describe('MeetingEntryPage', () => {
    describe('formatMeetingCode', () => {
        it('formats raw alphanumeric input with dashes', () => {
            expect(formatMeetingCode('ABC1234XYZ')).toBe('ABC-1234-XYZ');
        });

        it('handles partial input', () => {
            expect(formatMeetingCode('ABC')).toBe('ABC');
            expect(formatMeetingCode('ABC1')).toBe('ABC-1');
            expect(formatMeetingCode('ABC1234')).toBe('ABC-1234');
            expect(formatMeetingCode('ABC1234X')).toBe('ABC-1234-X');
        });

        it('converts to uppercase', () => {
            expect(formatMeetingCode('abc1234xyz')).toBe('ABC-1234-XYZ');
        });

        it('strips non-alphanumeric characters', () => {
            expect(formatMeetingCode('A!B@C#1234XYZ')).toBe('ABC-1234-XYZ');
        });

        it('extracts code from URLs', () => {
            expect(formatMeetingCode('https://quickmeet.com/ABC1234XYZ')).toBe('ABC-1234-XYZ');
        });

        it('handles empty input', () => {
            expect(formatMeetingCode('')).toBe('');
            expect(formatMeetingCode(null)).toBe('');
            expect(formatMeetingCode(undefined)).toBe('');
        });

        it('limits to 10 characters', () => {
            expect(formatMeetingCode('ABCDEFGHIJKLMNOP')).toBe('ABC-DEFG-HIJ');
        });
    });
});

