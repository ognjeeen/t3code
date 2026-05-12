import { CornerDownRightIcon, XIcon } from "lucide-react";

import {
  buildSelectedAssistantContextPreview,
  type SelectedAssistantContextDraft,
} from "./assistantSelectionContext";
import { Button } from "../ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { cn } from "~/lib/utils";

interface ComposerSelectedAssistantContextsProps {
  contexts: ReadonlyArray<SelectedAssistantContextDraft>;
  className?: string;
  onRemove: (contextId: string) => void;
  onContextClick: (contextId: string) => void;
}

export function ComposerSelectedAssistantContexts(props: ComposerSelectedAssistantContextsProps) {
  const { contexts, className, onRemove, onContextClick } = props;

  if (contexts.length === 0) {
    return null;
  }

  return (
    <div className={cn("mb-3 flex flex-col gap-2", className)}>
      {contexts.map((context) => {
        const previewText = buildSelectedAssistantContextPreview(context.text);
        return (
          <div
            key={context.id}
            className="flex items-start gap-2 rounded-xl border border-border/70 bg-muted/28 px-3 py-2 text-sm"
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => onContextClick(context.id)}
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/75">
                <CornerDownRightIcon className="size-3" />
                Selected context
              </span>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <p className="mt-1 line-clamp-2 min-w-0 break-words text-sm text-foreground/92">
                      {previewText}
                    </p>
                  }
                />
                <TooltipPopup side="top" className="max-w-96 whitespace-pre-wrap leading-tight">
                  {context.text}
                </TooltipPopup>
              </Tooltip>
            </button>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="mt-0.5 shrink-0 text-muted-foreground/70 hover:text-foreground"
              onClick={() => onRemove(context.id)}
              aria-label="Remove selected context"
            >
              <XIcon />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
