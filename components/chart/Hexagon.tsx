import { DOMAINS, type Domain, type DomainScore } from "@/lib/domain/types";

export interface HexagonProps {
  scores: DomainScore[];
  /** nominal size in px; the SVG scales to 100% width of its container */
  size?: number;
  labels: Record<Domain, string>;
  /** quarterly focus: axis + vertex drawn in gold */
  highlight?: Domain;
  className?: string;
}

const RINGS = 4;
/** Axis order is fixed: Body / Mind / Spirit / Relationships / Finance / Purpose. */
const ORDER: readonly Domain[] = DOMAINS;

function polar(cx: number, cy: number, r: number, index: number): { x: number; y: number } {
  // start at 12 o'clock and go clockwise, 60° per axis
  const angle = -Math.PI / 2 + (index * Math.PI) / 3;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function ring(cx: number, cy: number, r: number): string {
  return ORDER.map((_, i) => {
    const p = polar(cx, cy, r, i);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(" ");
}

/** Hand-rolled SVG radar over the six domains. Fill is the theme accent; highlight is gold. */
export function Hexagon({ scores, size = 280, labels, highlight, className }: HexagonProps) {
  const cx = size / 2;
  const cy = size / 2;
  const labelPad = 34;
  const radius = size / 2 - labelPad;
  const byDomain = new Map(scores.map((s) => [s.domain, s]));

  const points = ORDER.map((d, i) => {
    const ratio = Math.max(0, Math.min(1, byDomain.get(d)?.ratio ?? 0));
    return { domain: d, ratio, ...polar(cx, cy, radius * ratio, i) };
  });
  const polygon = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="auto"
      className={className}
      role="img"
      aria-label={ORDER.map((d) => `${labels[d]}: ${byDomain.get(d)?.value ?? 0}`).join(", ")}
      style={{ display: "block", maxWidth: size }}
    >
      {/* concentric rings */}
      {Array.from({ length: RINGS }, (_, i) => {
        const r = (radius * (i + 1)) / RINGS;
        return (
          <polygon
            key={r}
            points={ring(cx, cy, r)}
            fill={i === RINGS - 1 ? "var(--panel)" : "none"}
            stroke="var(--border)"
            strokeWidth={i === RINGS - 1 ? 1.25 : 1}
          />
        );
      })}

      {/* axes */}
      {ORDER.map((d, i) => {
        const p = polar(cx, cy, radius, i);
        const gold = d === highlight;
        return (
          <line
            key={d}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={gold ? "var(--gold)" : "var(--border)"}
            strokeWidth={gold ? 1.5 : 1}
            strokeDasharray={gold ? undefined : "2 3"}
            opacity={gold ? 0.9 : 1}
          />
        );
      })}

      {/* score polygon */}
      <polygon
        points={polygon}
        fill="var(--accent)"
        fillOpacity={0.35}
        stroke="var(--accent-2)"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ transition: "all 400ms ease" }}
      />

      {/* vertex dots */}
      {points.map((p) => {
        const gold = p.domain === highlight;
        return (
          <circle
            key={p.domain}
            cx={p.x}
            cy={p.y}
            r={gold ? 4.5 : 3.5}
            fill={gold ? "var(--gold-2)" : "var(--accent-2)"}
            stroke="var(--bg)"
            strokeWidth={1.5}
            style={{ transition: "all 400ms ease" }}
          />
        );
      })}

      {/* labels — anchored by absolute position, so LTR/RTL both read correctly */}
      {ORDER.map((d, i) => {
        const p = polar(cx, cy, radius + 18, i);
        const dx = p.x - cx;
        const anchor = Math.abs(dx) < 1 ? "middle" : dx > 0 ? "start" : "end";
        const dy = p.y < cy - 1 ? -2 : p.y > cy + 1 ? 10 : 4;
        const gold = d === highlight;
        return (
          <text
            key={d}
            x={p.x}
            y={p.y + dy}
            textAnchor={anchor}
            fontSize={11}
            fontWeight={gold ? 600 : 400}
            fill={gold ? "var(--gold-2)" : "var(--fg-muted)"}
            style={{ letterSpacing: "0.04em" }}
          >
            {labels[d]}
          </text>
        );
      })}
    </svg>
  );
}
