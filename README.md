# Mission Zero (MVP)

Mobile-first, bilingual (EN/HE, RTL-aware) Next.js + Tailwind app: a cinematic year countdown,
per-warrior profiles, an identity onboarding journey (from the *Identity Workshop*), an RPG
dashboard (33 levels, six-domain hexagon, Quarterly Focus, Minimum Viable Week), journaling with
reflection gates, and a mocked AI layer — all persisted behind a swappable repository
(localStorage today, Supabase stub tomorrow).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run lint
```

Copy `.env.example` to `.env.local` if you want to change the storage/AI driver.

## Layout

| Path | Purpose |
| --- | --- |
| `app/` | routes: `/` (countdown + warrior carousel), `/onboarding/[step]`, `/dashboard`, `/journal`, `/reflections` |
| `lib/domain/` | frozen domain types, ids/dates helpers, seeds, career-audit scoring stub |
| `lib/storage/` | `Repository` contract, `localStorageRepository` (`wia:v1:` keys), `supabaseRepository` stub, driver factory |
| `lib/store/` | React context + hooks — the only way UI reaches persistence |
| `lib/i18n/` + `messages/` | `t()` + `useT()`, EN/HE messages; locale persisted in the repository |
| `lib/game/` | XP curve / levels, task helpers, domain aggregation, streak logic |
| `lib/ai/` | provider interface, deterministic mock, external copy/paste assist |
| `components/ui/` | Panel, Stat, Button, Sheet, UserText, TextField/TextArea, Chip, ProgressBar |
| `docs/identity-workshop-notes.md` | onboarding spec extracted from the workshop PDF |
| `supabase/schema.sql` | SQL mirror of the domain types (not applied yet) |

## Rules of the house

- User-authored text is always rendered with `dir="auto"` + `unicode-bidi: plaintext` (`<UserText>`, `<TextField>`, `<TextArea>`).
- No component touches `localStorage`; everything goes through `lib/store/`.
- Progress is never destructive: Minimum Viable Week preserves streak and XP.
- AI refinements/translations are stored **alongside** originals, never over them.
