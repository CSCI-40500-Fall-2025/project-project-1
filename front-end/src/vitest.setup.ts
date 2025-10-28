import "@testing-library/jest-dom";
import "whatwg-fetch";

import { vi } from "vitest";

vi.mock("whatwg-url", () => ({
  URL: class {
    constructor() {}
  },
}));
