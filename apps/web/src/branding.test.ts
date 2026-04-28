import { afterEach, describe, expect, it, vi } from "vitest";

const originalWindow = globalThis.window;

afterEach(() => {
  vi.resetModules();

  if (originalWindow === undefined) {
    Reflect.deleteProperty(globalThis, "window");
    return;
  }

  globalThis.window = originalWindow;
});

describe("branding", () => {
  it("uses injected desktop branding when available", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        desktopBridge: {
          getAppBranding: () => ({
            baseName: "T3M0",
            stageLabel: "Nightly",
            displayName: "T3M0 (Nightly)",
          }),
        },
      },
    });

    const branding = await import("./branding");

    expect(branding.APP_BASE_NAME).toBe("T3M0");
    expect(branding.APP_STAGE_LABEL).toBe("Nightly");
    expect(branding.APP_DISPLAY_NAME).toBe("T3M0 (Nightly)");
  });
});
