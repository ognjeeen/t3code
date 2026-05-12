import "../../index.css";

import { page } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useRef } from "react";

import { AssistantSelectionContextToolbar } from "./AssistantSelectionContextToolbar";

function createDomRect(rect: {
  top: number;
  left: number;
  width: number;
  height: number;
}): DOMRect {
  return {
    ...rect,
    bottom: rect.top + rect.height,
    right: rect.left + rect.width,
    x: rect.left,
    y: rect.top,
    toJSON: () => rect,
  } as DOMRect;
}

function ToolbarFixture(props: {
  onInsertSelectedContext: (selectedText: string, messageId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} data-testid="messages-area" className="relative w-[640px] p-6">
      <div data-timeline-row-kind="message" data-message-role="assistant" data-message-id="msg-1">
        <p data-testid="assistant-message-1">Assistant selected text here.</p>
      </div>
      <div data-timeline-row-kind="message" data-message-role="user">
        <p data-testid="user-message">User selected text here.</p>
      </div>
      <div data-timeline-row-kind="message" data-message-role="assistant" data-message-id="msg-2">
        <p data-testid="assistant-message-2">Second assistant message.</p>
      </div>
      <AssistantSelectionContextToolbar
        containerRef={containerRef}
        onInsertSelectedContext={props.onInsertSelectedContext}
      />
    </div>
  );
}

function setElementRect(element: Element, rect: DOMRect) {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => rect,
  });
}

function completeMouseSelection() {
  window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
}

function startMouseSelection() {
  window.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
}

function selectText(element: HTMLElement, start: number, end: number) {
  const textNode = element.firstChild;
  if (!textNode) {
    throw new Error("Expected text node");
  }
  const range = document.createRange();
  range.setStart(textNode, start);
  range.setEnd(textNode, end);
  const selection = window.getSelection();
  if (!selection) {
    throw new Error("Expected selection");
  }
  selection.removeAllRanges();
  selection.addRange(range);
  document.dispatchEvent(new Event("selectionchange"));
}

function selectAcrossElements(
  startElement: HTMLElement,
  startOffset: number,
  endElement: HTMLElement,
  endOffset: number,
) {
  const startNode = startElement.firstChild;
  const endNode = endElement.firstChild;
  if (!startNode || !endNode) {
    throw new Error("Expected text nodes");
  }
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  const selection = window.getSelection();
  if (!selection) {
    throw new Error("Expected selection");
  }
  selection.removeAllRanges();
  selection.addRange(range);
  document.dispatchEvent(new Event("selectionchange"));
}

describe("AssistantSelectionContextToolbar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.getSelection()?.removeAllRanges();
    document.body.innerHTML = "";
  });

  it("shows the toolbar for assistant selections", async () => {
    const onInsertSelectedContext = vi.fn();
    const screen = await render(
      <ToolbarFixture onInsertSelectedContext={onInsertSelectedContext} />,
    );

    const container = document.querySelector('[data-testid="messages-area"]');
    const assistantMessage = document.querySelector(
      '[data-testid="assistant-message-1"]',
    ) as HTMLElement | null;
    expect(container).not.toBeNull();
    expect(assistantMessage).not.toBeNull();

    setElementRect(container!, createDomRect({ top: 0, left: 0, width: 640, height: 320 }));
    vi.spyOn(Range.prototype, "getBoundingClientRect").mockImplementation(() =>
      createDomRect({ top: 120, left: 140, width: 120, height: 20 }),
    );

    startMouseSelection();
    selectText(assistantMessage!, 10, 18);
    await expect.element(page.getByRole("button", { name: "Add context" })).not.toBeInTheDocument();
    completeMouseSelection();

    try {
      await expect.element(page.getByRole("button", { name: "Add context" })).toBeVisible();
    } finally {
      await screen.unmount();
    }
  });

  it("clicking the toolbar forwards the selected text", async () => {
    const onInsertSelectedContext = vi.fn();
    const screen = await render(
      <ToolbarFixture onInsertSelectedContext={onInsertSelectedContext} />,
    );

    const container = document.querySelector('[data-testid="messages-area"]');
    const assistantMessage = document.querySelector(
      '[data-testid="assistant-message-1"]',
    ) as HTMLElement | null;
    expect(container).not.toBeNull();
    expect(assistantMessage).not.toBeNull();

    setElementRect(container!, createDomRect({ top: 0, left: 0, width: 640, height: 320 }));
    vi.spyOn(Range.prototype, "getBoundingClientRect").mockImplementation(() =>
      createDomRect({ top: 120, left: 140, width: 120, height: 20 }),
    );

    startMouseSelection();
    selectText(assistantMessage!, 10, 18);
    completeMouseSelection();
    const button = page.getByRole("button", { name: "Add context" });

    try {
      await expect.element(button).toBeVisible();
      await button.click();
      expect(onInsertSelectedContext).toHaveBeenCalledWith("selected", "msg-1");
    } finally {
      await screen.unmount();
    }
  });

  it("does not show the toolbar for user message selections", async () => {
    const onInsertSelectedContext = vi.fn();
    const screen = await render(
      <ToolbarFixture onInsertSelectedContext={onInsertSelectedContext} />,
    );

    const container = document.querySelector('[data-testid="messages-area"]');
    const userMessage = document.querySelector(
      '[data-testid="user-message"]',
    ) as HTMLElement | null;
    expect(container).not.toBeNull();
    expect(userMessage).not.toBeNull();

    setElementRect(container!, createDomRect({ top: 0, left: 0, width: 640, height: 320 }));
    vi.spyOn(Range.prototype, "getBoundingClientRect").mockImplementation(() =>
      createDomRect({ top: 160, left: 140, width: 120, height: 20 }),
    );

    startMouseSelection();
    selectText(userMessage!, 0, 4);
    completeMouseSelection();

    try {
      await expect
        .element(page.getByRole("button", { name: "Add context" }))
        .not.toBeInTheDocument();
    } finally {
      await screen.unmount();
    }
  });

  it("does not show the toolbar for cross-message selections", async () => {
    const onInsertSelectedContext = vi.fn();
    const screen = await render(
      <ToolbarFixture onInsertSelectedContext={onInsertSelectedContext} />,
    );

    const container = document.querySelector('[data-testid="messages-area"]');
    const firstAssistant = document.querySelector(
      '[data-testid="assistant-message-1"]',
    ) as HTMLElement | null;
    const secondAssistant = document.querySelector(
      '[data-testid="assistant-message-2"]',
    ) as HTMLElement | null;
    expect(container).not.toBeNull();
    expect(firstAssistant).not.toBeNull();
    expect(secondAssistant).not.toBeNull();

    setElementRect(container!, createDomRect({ top: 0, left: 0, width: 640, height: 320 }));
    vi.spyOn(Range.prototype, "getBoundingClientRect").mockImplementation(() =>
      createDomRect({ top: 120, left: 140, width: 220, height: 20 }),
    );

    startMouseSelection();
    selectAcrossElements(firstAssistant!, 10, secondAssistant!, 6);
    completeMouseSelection();

    try {
      await expect
        .element(page.getByRole("button", { name: "Add context" }))
        .not.toBeInTheDocument();
    } finally {
      await screen.unmount();
    }
  });
});
