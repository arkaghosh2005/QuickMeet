/**
 * QuickMeet — Comprehensive Test Suite
 *
 * This file aggregates all tests. Run with: npm test
 * Vitest automatically discovers all *.test.* files, so this file
 * serves as documentation of the full test suite.
 *
 * All tests live under src/__tests__/ with category subfolders:
 *
 * __tests__/
 * ├── components/
 * │   ├── Button.test.jsx         — Button component variants
 * │   ├── ChatPanel.test.jsx      — Chat panel rendering & interaction
 * │   ├── ConfirmModal.test.jsx   — Confirm modal behavior & a11y
 * │   ├── ErrorBoundary.test.jsx  — Error boundary fallback
 * │   └── Skeleton.test.jsx       — Skeleton loading component
 * ├── context/
 * │   └── ThemeContext.test.jsx   — Dark mode toggle + localStorage
 * ├── pages/
 * │   ├── MeetingCode.test.js     — Meeting code format/validation
 * │   └── MeetingEntryPage.test.js — formatMeetingCode utility
 * ├── utils/
 * │   └── mediaHelpers.test.js    — silence() and black() helpers
 * └── all.test.js                 — This documentation file
 */

// Vitest runs all *.test.* files automatically — no manual imports needed.
// Run: npm test          (watch mode)
// Run: npm run test:run  (single run)
