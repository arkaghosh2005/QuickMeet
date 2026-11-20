/**
 * QuickMeet — Comprehensive Test Suite
 *
 * This file documents the full test suite. Run with: npm test
 * Vitest automatically discovers all *.test.* files, so this file
 * serves as documentation only.
 *
 * All tests live under src/__tests__/ with category subfolders:
 *
 * __tests__/
 * ├── components/
 * │   ├── Button.test.jsx           — Button component variants
 * │   ├── ChatPanel.test.jsx        — Chat panel rendering & interaction
 * │   ├── ConfirmModal.test.jsx     — Confirm modal behavior & a11y
 * │   ├── DarkModeToggle.test.jsx   — Dark mode toggle rendering & a11y
 * │   ├── ErrorBoundary.test.jsx    — Error boundary fallback
 * │   ├── Input.test.jsx            — Input with icon, suffix, error, dark mode
 * │   ├── ParticipantTile.test.jsx  — Tile rendering, video always in DOM, avatar
 * │   └── Skeleton.test.jsx         — Skeleton loading component
 * ├── context/
 * │   └── ThemeContext.test.jsx     — Dark mode toggle + localStorage
 * ├── pages/
 * │   ├── MeetingCode.test.js       — Meeting code format/validation
 * │   └── MeetingEntryPage.test.js  — formatMeetingCode utility
 * ├── utils/
 * │   └── mediaHelpers.test.js      — silence() and black() helpers
 * └── all.test.js                   — This documentation file
 */

// A minimal test so Vitest doesn't error on "No test suite found"
import { describe, it, expect } from 'vitest';

describe('Test Suite Documentation', () => {
    it('test suite is configured correctly', () => {
        expect(true).toBe(true);
    });
});
