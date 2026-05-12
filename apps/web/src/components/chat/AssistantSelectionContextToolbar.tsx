import { ReplyIcon } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState, type RefObject } from "react";

import { Button } from "../ui/button";

interface AssistantSelectionContextToolbarProps {
  containerRef: RefObject<HTMLElement | null>;
  onInsertSelectedContext: (selectedText: string, messageId: string) => void;
}

interface ToolbarState {
  left: number;
  top: number;
  selectedText: string;
  messageId: string;
}

const ROW_SELECTOR = '[data-timeline-row-kind="message"][data-message-role="assistant"]';
const TOOLBAR_VERTICAL_OFFSET_PX = 10;
const TOOLBAR_WIDTH_PX = 152;

function resolveAssistantRow(node: Node | null): HTMLElement | null {
  const element = node instanceof Element ? node : node?.parentElement;
  return element?.closest<HTMLElement>(ROW_SELECTOR) ?? null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const AssistantSelectionContextToolbar = memo(function AssistantSelectionContextToolbar({
  containerRef,
  onInsertSelectedContext,
}: AssistantSelectionContextToolbarProps) {
  const [toolbarState, setToolbarState] = useState<ToolbarState | null>(null);
  const selectionInProgressRef = useRef(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const updateToolbar = useCallback(() => {
    const container = containerRef.current;
    const selection = window.getSelection();
    if (!container || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setToolbarState(null);
      return;
    }

    const selectedText = selection.toString();
    if (selectedText.trim().length === 0) {
      setToolbarState(null);
      return;
    }

    const startRow = resolveAssistantRow(selection.anchorNode);
    const endRow = resolveAssistantRow(selection.focusNode);
    if (!startRow || !endRow || startRow !== endRow) {
      setToolbarState(null);
      return;
    }
    const messageId = startRow.dataset.messageId?.trim() ?? "";
    if (messageId.length === 0) {
      setToolbarState(null);
      return;
    }

    if (!container.contains(startRow)) {
      setToolbarState(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) {
      setToolbarState(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();
    const targetCenter = rangeRect.left - containerRect.left + rangeRect.width / 2;
    const horizontalPadding = 12;
    const left = clamp(
      targetCenter,
      horizontalPadding + TOOLBAR_WIDTH_PX / 2,
      Math.max(
        horizontalPadding + TOOLBAR_WIDTH_PX / 2,
        containerRect.width - horizontalPadding - TOOLBAR_WIDTH_PX / 2,
      ),
    );
    const top = rangeRect.top - containerRect.top - TOOLBAR_VERTICAL_OFFSET_PX;

    setToolbarState({
      left,
      top,
      selectedText,
      messageId,
    });
  }, [containerRef]);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (selectionInProgressRef.current) {
        setToolbarState(null);
        return;
      }
      updateToolbar();
    };

    const handleViewportChange = () => {
      updateToolbar();
    };

    const handleSelectionStart = (event: MouseEvent | TouchEvent) => {
      const eventTarget = event.target;
      if (eventTarget instanceof Node && toolbarRef.current?.contains(eventTarget)) {
        return;
      }
      selectionInProgressRef.current = true;
      setToolbarState(null);
    };

    const handleSelectionComplete = () => {
      selectionInProgressRef.current = false;
      updateToolbar();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("mousedown", handleSelectionStart, true);
    window.addEventListener("mouseup", handleSelectionComplete, true);
    window.addEventListener("touchstart", handleSelectionStart, true);
    window.addEventListener("touchend", handleSelectionComplete, true);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("keyup", handleSelectionComplete, true);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("mousedown", handleSelectionStart, true);
      window.removeEventListener("mouseup", handleSelectionComplete, true);
      window.removeEventListener("touchstart", handleSelectionStart, true);
      window.removeEventListener("touchend", handleSelectionComplete, true);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("keyup", handleSelectionComplete, true);
    };
  }, [updateToolbar]);

  if (!toolbarState) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className="pointer-events-none absolute z-20"
      style={{
        left: `${toolbarState.left}px`,
        top: `${toolbarState.top}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <Button
        size="xs"
        variant="outline"
        className="pointer-events-auto h-6 gap-1 rounded-md border-border/70 bg-popover/95 px-2 text-[11px] text-muted-foreground shadow-sm backdrop-blur-xs hover:text-foreground [&_svg]:size-3"
        data-testid="assistant-selection-context-toolbar"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          onInsertSelectedContext(toolbarState.selectedText, toolbarState.messageId);
          window.getSelection()?.removeAllRanges();
          setToolbarState(null);
        }}
      >
        <ReplyIcon />
        Add context
      </Button>
    </div>
  );
});
