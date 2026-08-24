import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: "default" | "strong" | "accent";
  rivets?: boolean;
  title?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}

export function Panel({
  variant = "default",
  rivets = false,
  title,
  action,
  padded = true,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <section
      className={cn(
        "panel",
        variant === "strong" && "panel-strong",
        variant === "accent" && "panel-accent",
        rivets && "rivets",
        padded && "p-4",
        className,
      )}
      {...rest}
    >
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-3">
          {title && <h3 className="text-sm uppercase tracking-widest text-gold">{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
