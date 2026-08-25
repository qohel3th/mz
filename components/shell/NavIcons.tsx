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

/** Identity — engraved seal: outer ring, inner diamond sigil, four notches. */
export function IdentityIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 6.5 17.5 12 12 17.5 6.5 12Z" />
      <path d="M12 9.5v5M9.5 12h5" />
      <path d="M12 2.5v1.5M12 20v1.5M2.5 12H4M20 12h1.5" />
    </Base>
  );
}

/** Map — brass astrolabe: ring, inner rete arc, cross-hairs, pivot. */
export function MapIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4" />
      <path d="M6.2 6.2 8.8 8.8M15.2 15.2l2.6 2.6" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
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

/** Reflection — crescent inside a riveted ring. */
export function ReflectionIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.6 7.2a5 5 0 1 0 2.2 8.9 6 6 0 0 1-2.2-8.9Z" />
      <circle cx="12" cy="3.6" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="20.4" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="3.6" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="20.4" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Brand mark — hexagon with a rising blade (the MZ crest). */
export function BrandMark(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4Z" />
      <path d="M12 6.5v10" />
      <path d="M9 13.5h6" />
      <path d="M10.4 8.4 12 6.5l1.6 1.9" />
    </Base>
  );
}
