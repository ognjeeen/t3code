import { describe, expect, it } from "vitest";

import {
  appendSelectedAssistantContextsToPrompt,
  buildSelectedAssistantContextPreview,
  formatSelectedAssistantContextBlock,
  MAX_SELECTED_CONTEXT_CHARS,
  normalizeSelectedAssistantContextDraft,
  normalizeSelectedContextWhitespace,
} from "./assistantSelectionContext";

describe("assistantSelectionContext", () => {
  it("normalizes whitespace while preserving paragraph breaks", () => {
    expect(
      normalizeSelectedContextWhitespace(" \r\n first   line   \r\n\r\n\r\nsecond line  \r\n "),
    ).toBe("first line\n\nsecond line");
  });

  it("formats selected text as a quoted context block", () => {
    expect(formatSelectedAssistantContextBlock("first line\nsecond line")).toBe(
      "Selected context:\n> first line\n> second line",
    );
  });

  it("appends selected assistant contexts after an existing draft with one blank line", () => {
    expect(
      appendSelectedAssistantContextsToPrompt("Existing draft", [
        {
          id: "ctx-1",
          messageId: "message-1" as never,
          createdAt: "2026-04-29T00:00:00.000Z",
          text: "selected text",
        },
      ]),
    ).toBe("Existing draft\n\nSelected context:\n> selected text");
  });

  it("truncates oversized selections and adds a truncation marker", () => {
    const input = "x".repeat(MAX_SELECTED_CONTEXT_CHARS + 20);
    const output = formatSelectedAssistantContextBlock(input);

    expect(output).toContain("[selection truncated]");
    expect(output).toMatch(/^Selected context:\n> x+/);
    expect(output.split("\n").at(-1)).toBe("> [selection truncated]");
  });

  it("normalizes stored drafts and builds compact previews", () => {
    expect(
      normalizeSelectedAssistantContextDraft({
        id: " ctx-1 ",
        messageId: " message-1 " as never,
        createdAt: " 2026-04-29T00:00:00.000Z ",
        text: "  first   line \n\n second line  ",
      }),
    ).toMatchObject({
      id: "ctx-1",
      messageId: "message-1",
      createdAt: "2026-04-29T00:00:00.000Z",
      text: "first line\n\n second line",
    });
    expect(buildSelectedAssistantContextPreview("first line\nsecond line", 12)).toBe(
      "first lin...",
    );
  });
});
