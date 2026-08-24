import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  icon?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none select-none";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-accent-fg shadow-[0_8px_24px_-10px_var(--accent)] hover:bg-accent-2",
  secondary: "border border-border-strong bg-panel-strong text-fg hover:border-gold",
  ghost: "text-fg-muted hover:text-fg hover:bg-panel",
  gold: "bg-gold text-bg font-semibold hover:bg-gold-2",
  danger: "bg-red text-white hover:bg-red-2",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  block,
  icon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
