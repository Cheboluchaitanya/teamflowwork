import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable,
  value: (query) => ({
    matches,
    media,
    onchange,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

