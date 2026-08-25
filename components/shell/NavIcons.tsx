import type { SVGProps } from "react";

/**
 * Steampunk-arcane nav icon set. One geometry system: 24×24 viewBox,
 * 1.6 stroke, currentColor, no fills. No emoji, no icon library.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Identity — a hand mirror: the self, seen. */
export function IdentityIcon(p: IconProps) {
  return (
    <Base {...p}>
      <ellipse cx="12" cy="9" rx="5.6" ry="6.4" />
      <ellipse cx="12" cy="9" rx="3.6" ry="4.4" />
      <path d="M12 15.4v2.2" />
      <path d="M9.4 20.5c.9-1.9 1.8-2.9 2.6-2.9s1.7 1 2.6 2.9" />
      <path d="M10.3 6.6c.5-.9 1.2-1.4 2-1.5" />
    </Base>
  );
}

/** Map — a folded parchment chart with a dotted route ending at an X. */
export function MapIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2Z" />
      <path d="M9 4.5v13M15 6.5v13" />
      <path d="M5.5 15.5c1.6-1.2 2.7-1 3.6.2 1 1.3 2.2.9 3.2-.6" strokeDasharray="1.6 1.8" />
      <path d="M16.6 9.4l2.2 2.2M18.8 9.4l-2.2 2.2" />
    </Base>
  );
}

/** Dashboard — cog with a hexagon core. */
export function DashboardIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
      <circle cx="12" cy="12" r="6.6" />
      <path d="M12 8.4l3.1 1.8v3.6L12 15.6l-3.1-1.8v-3.6Z" />
    </Base>
  );
}

/** Journal — quill on a plate. */
export function JournalIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4.5 19.5h15" />
      <path d="M7 17.5c1-6 5-11 12-13-1.5 5-5 9.5-10.5 11" />
      <path d="M7 17.5 12.5 9" />
      <path d="M10.8 12.6c1.6.2 2.9-.2 4.2-1.1" />
    </Base>
  );
}

/** Reflection — a crescent moon over still water. */
export function ReflectionIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M14.8 3.6a6.2 6.2 0 1 0 3.9 9.6 7 7 0 0 1-3.9-9.6Z" />
      <path d="M3.5 17.2c1.6 1.2 3.1 1.2 4.7 0s3.1-1.2 4.7 0 3.1 1.2 4.7 0 3.1-1.2 4.9 0" />
      <path d="M5 20.4c1.4 1 2.7 1 4.1 0s2.7-1 4.1 0 2.7 1 4.1 0" />
      <path d="M6.2 5.2v1.6M5.4 6h1.6" />
    </Base>
  );
}

/** Brand mark — two crossed swords. */
export function BrandMark(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 4l11.5 11.5M20 4 8.5 15.5" />
      <path d="M4 4h3.2M4 4v3.2M20 4h-3.2M20 4v3.2" />
      <path d="M13.5 13.5 18 18M10.5 13.5 6 18" />
      <path d="M15.6 17.4l1.2-1.2M8.4 17.4l-1.2-1.2" />
      <path d="M18 18l1.5 1.5M6 18l-1.5 1.5" />
    </Base>
  );
}
