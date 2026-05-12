import { type MessageId } from "@t3tools/contracts";

export interface SelectedAssistantContextDraft {
  id: string;
  messageId: MessageId;
  text: string;
  createdAt: string;
}

export const MAX_SELECTED_CONTEXT_CHARS = 12_000;
const SELECTION_TRUNCATED_LABEL = "[selection truncated]";

export function normalizeSelectedContextWhitespace(value: string): string {
  const normalizedLineEndings = value.replace(/\r\n?/g, "\n");
  const trimmedLines = normalizedLineEndings
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+$/g, ""));
  const collapsed = trimmedLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return collapsed.replace(/[^\S\n]{2,}/g, " ");
}

export function clampSelectedContext(value: string, maxChars = MAX_SELECTED_CONTEXT_CHARS): string {
  if (value.length <= maxChars) {
    return value;
  }
  const suffix = `\n${SELECTION_TRUNCATED_LABEL}`;
  const truncatedValue = value.slice(0, Math.max(0, maxChars - suffix.length)).trimEnd();
  return `${truncatedValue}${suffix}`;
}

export function normalizeSelectedAssistantContextDraft(
  draft: SelectedAssistantContextDraft,
): SelectedAssistantContextDraft | null {
  const normalizedText = clampSelectedContext(normalizeSelectedContextWhitespace(draft.text));
  const id = draft.id.trim();
  const messageId = draft.messageId.trim() as MessageId;
  const createdAt = draft.createdAt.trim();
  if (
    id.length === 0 ||
    messageId.length === 0 ||
    createdAt.length === 0 ||
    normalizedText.length === 0
  ) {
    return null;
  }
  return {
    ...draft,
    id,
    messageId,
    createdAt,
    text: normalizedText,
  };
}

export function formatSelectedAssistantContextBlock(selectedText: string): string {
  const quoted = clampSelectedContext(normalizeSelectedContextWhitespace(selectedText))
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  return `Selected context:\n${quoted}`;
}

export function appendSelectedAssistantContextsToPrompt(
  prompt: string,
  contexts: ReadonlyArray<SelectedAssistantContextDraft>,
): string {
  const trimmedPrompt = prompt.trim();
  const contextBlocks = contexts
    .flatMap((context) => {
      const normalized = normalizeSelectedAssistantContextDraft(context);
      return normalized ? [formatSelectedAssistantContextBlock(normalized.text)] : [];
    })
    .join("\n\n");
  if (contextBlocks.length === 0) {
    return trimmedPrompt;
  }
  return trimmedPrompt.length > 0 ? `${trimmedPrompt}\n\n${contextBlocks}` : contextBlocks;
}

export function buildSelectedAssistantContextPreview(text: string, maxChars = 140): string {
  const normalized = normalizeSelectedContextWhitespace(text);
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}
