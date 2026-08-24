import type { ElementType, HTMLAttributes } from "react";
import { cn } from "./cn";

export interface UserTextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  text?: string | null;
  /** preserve newlines */
  multiline?: boolean;
}

/**
 * The ONLY sanctioned way to render user-authored content.
 * Applies dir="auto" + unicode-bidi: plaintext so mixed EN/HE
 * paragraphs keep their own alignment.
 */
export function UserText({ as: Tag = "span", text, multiline, className, children, ...rest }: UserTextProps) {
  return (
    <Tag dir="auto" className={cn("bidi", multiline && "whitespace-pre-wrap", className)} {...rest}>
      {text ?? children}
    </Tag>
  );
}
