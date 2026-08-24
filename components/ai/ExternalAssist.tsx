"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/i18n/useT";
import { parseResponse, serializePrompt, type ExternalContext, type ParsedExternalResponse } from "@/lib/ai";
import { Button, Sheet, TextArea, cn } from "@/components/ui";

export interface ExternalAssistProps {
  context: ExternalContext;
  onImport(parsed: NonNullable<ParsedExternalResponse>): void;
  className?: string;
}

/**
 * "Copy Prompt" → clipboard (with a read-only fallback when the clipboard is
 * unavailable) and "Paste External Response" → bottom sheet → parseResponse → onImport.
 * Imported values are stored beside the original, never overwriting it.
 */
export function ExternalAssist({ context, onImport, className }: ExternalAssistProps) {
  const { t } = useT();
  const prompt = useMemo(() => serializePrompt(context), [context]);
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  useEffect(() => {
    if (!imported) return;
    const id = setTimeout(() => setImported(false), 2500);
    return () => clearTimeout(id);
  }, [imported]);

  async function copyPrompt() {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setFallback(false);
    } catch {
      setFallback(true);
    }
  }

  function submit() {
    const parsed = parseResponse(raw);
    if (!parsed) {
      setError(true);
      return;
    }
    setError(false);
    onImport(parsed);
    setRaw("");
    setOpen(false);
    setImported(true);
  }

  function close() {
    setOpen(false);
    setError(false);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-xs text-fg-muted">{t("ai.externalHelper")}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={copyPrompt}>
          {t("ai.copyPrompt")}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          {t("ai.pasteResponse")}
        </Button>
        {copied && (
          <span role="status" className="text-xs text-success animate-fade-in">
            {t("ai.copied")}
          </span>
        )}
        {imported && (
          <span role="status" className="text-xs text-success animate-fade-in">
            {t("ai.imported")}
          </span>
        )}
      </div>

      {fallback && (
        <TextArea
          readOnly
          rows={8}
          value={prompt}
          label={t("ai.promptFallback")}
          onFocus={(e) => e.currentTarget.select()}
          className="text-xs"
        />
      )}

      <Sheet open={open} onClose={close} title={t("ai.externalTitle")}>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-fg-muted">{t("ai.externalHelper")}</p>
          <TextArea
            rows={8}
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              if (error) setError(false);
            }}
            label={t("ai.pasteLabel")}
            placeholder={t("ai.pastePlaceholder")}
            autoFocus
          />
          {error && (
            <p role="alert" className="text-xs text-danger">
              {t("ai.parseError")}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={close}>
              {t("ai.cancel")}
            </Button>
            <Button size="sm" onClick={submit} disabled={!raw.trim()}>
              {t("ai.import")}
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
