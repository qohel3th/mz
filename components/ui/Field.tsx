import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

const fieldBase =
  "bidi w-full rounded-[var(--radius)] border border-border bg-bg-3/70 px-3.5 py-3 text-base text-fg placeholder:text-fg-faint outline-none transition focus:border-accent-2 focus:ring-2 focus:ring-accent/30";

interface LabelProps {
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

function Wrap({ label, hint, className, children }: LabelProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      {label && <span className="text-xs uppercase tracking-widest text-fg-muted">{label}</span>}
      {children}
      {hint && <span className="text-xs text-fg-faint">{hint}</span>}
    </label>
  );
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  wrapClassName?: string;
}

/** Single-line user input. dir="auto" is mandatory for user-authored text. */
export function TextField({ label, hint, wrapClassName, className, ...rest }: TextFieldProps) {
  return (
    <Wrap label={label} hint={hint} className={wrapClassName}>
      <input dir="auto" className={cn(fieldBase, className)} {...rest} />
    </Wrap>
  );
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  wrapClassName?: string;
}

/** Multi-line user input. dir="auto" is mandatory for user-authored text. */
export function TextArea({ label, hint, wrapClassName, className, rows = 4, ...rest }: TextAreaProps) {
  return (
    <Wrap label={label} hint={hint} className={wrapClassName}>
      <textarea dir="auto" rows={rows} className={cn(fieldBase, "resize-y", className)} {...rest} />
    </Wrap>
  );
}
