import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientOrigin } from "../config";

afterEach(() => {
  vi.unstubAllEnvs();
});

const deployedClientOrigin = "https://slicedrop-client.example";
const viteDevServerOrigin = "http://localhost:5173";

describe("getClientOrigin", () => {
  it("uses CLIENT_ORIGIN from the environment when it is set", () => {
    vi.stubEnv("CLIENT_ORIGIN", deployedClientOrigin);
    expect(getClientOrigin()).toBe(deployedClientOrigin);
  });

  it("falls back to the client's dev server when CLIENT_ORIGIN is not set", () => {
    vi.stubEnv("CLIENT_ORIGIN", undefined);
    expect(getClientOrigin()).toBe(viteDevServerOrigin);
  });
});
