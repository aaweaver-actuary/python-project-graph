import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

const createIdentityScreenCtm = () => ({
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
  inverse() {
    return this;
  },
});

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
}

if (typeof SVGElement !== "undefined") {
  if (typeof SVGElement.prototype.getBBox !== "function") {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }),
    });
  }

  if (typeof SVGElement.prototype.getScreenCTM !== "function") {
    Object.defineProperty(SVGElement.prototype, "getScreenCTM", {
      configurable: true,
      value: () => createIdentityScreenCtm(),
    });
  }
}

afterEach(cleanup);
