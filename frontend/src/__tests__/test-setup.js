import '@testing-library/jest-dom';

// jsdom does not implement scrollIntoView — provide a no-op stub
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function () {};
