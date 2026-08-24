/** One short quotation per card, max. Styled as a brass-edged aside. */
export function Epigraph({ text, by }: { text: string; by?: string }) {
  return (
    <blockquote className="border-s-2 border-gold/50 ps-3 text-sm italic leading-relaxed text-fg-muted">
      {text}
      {by && <footer className="mt-1 text-xs not-italic tracking-wider text-fg-faint">— {by}</footer>}
    </blockquote>
  );
}
