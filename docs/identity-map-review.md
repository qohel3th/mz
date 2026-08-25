# Identity + Map — review notes (mock-data screens)

Built overnight for visual review. Everything below is a decision you may want to change.
Both screens are **visual-only**: nothing is persisted; all data lives in `lib/identity/personas.ts` and `lib/map/milestones.ts`.

## Where things are
- `/identity` — creed banner + three persona tickets (Soul / Body / Mind) for the active warrior.
- `/map` — ten waystones on a winding road, tap a stone → detail sheet.
- Bottom nav **Identity** tab now points to `/identity` (was `/onboarding`). The 7-step workshop is untouched and still reachable from the "Identity workshop" button on the Identity screen (and at `/onboarding` directly).

## Decisions to confirm or change

### Identity route (Blast-Radius call)
- Chose **(b)**: new `app/identity/page.tsx` + nav repoint. Reason: `/onboarding` auto-redirects mid-workshop warriors to their resume step, which would hide the new screen. Only shell change: one `href` in `components/shell/BottomNav.tsx`.

### Persona data (`lib/identity/personas.ts`) — archetypes are yours, prose is mine
| Warrior | Pillar | Archetype (yours) | Title (placeholder) | Essence (placeholder) | Traits (placeholder) |
|---|---|---|---|---|---|
| Nachman | Soul | Alchemist | Transmuter of the Real | Turns lead days into gold — magic, transformation, the hidden fire. | transformation · magic · patience |
| Nachman | Body | Kinetic | The Dancer | Always in motion; supple and strong, never stiff, never still. | motion · suppleness · strength |
| Nachman | Mind | Architect | Builder of Systems | Sees the structure under the noise, then solves it and builds it. | structure · problem-solving · vision |
| Leo | Soul | Bard | Teller of the Tale | Tells the story through music — every day another verse. | music · story · presence |
| Leo | Body | Kinetic | The Dancer | (same as Nachman's Kinetic) | (same) |
| Leo | Mind | Facilitator | Maker of Motion | Makes things happen — brings the right people to the right room. | momentum · people · execution |

### Persona portraits — how to drop in real art (zero code changes)
- Each ticket looks for `public/portraits/personas/<warrior>-<archetype>.jpg`, lowercase:
  `nachman-alchemist.jpg`, `nachman-kinetic.jpg`, `nachman-architect.jpg`, `leo-bard.jpg`, `leo-kinetic.jpg`, `leo-facilitator.jpg`.
- Until a file exists, the ticket falls back to the warrior portrait (`/portraits/leo.jpg`, `/portraits/nachman.jpg`) — that is why all three tickets currently show the same face.
- Recommended size ≈ 640×860 (3:4), JPEG. No image generation was available in this session.

### Identity screen layout
- Tickets use the existing **horizontal snap scroller** (same as the landing carousel), one ticket ≈ 78vw, peeking the next. Alternative is a vertical stack — say so if you'd rather scroll down.
- Ticket is ~3:4 (`.persona-ticket`), same veil/frame/crest language as the warrior card. Pillar colours: Soul = purple, Body = red, Mind = gold (existing tokens).
- Creed copy: *"An artist's soul, an athlete's body, an entrepreneur's mind."* Sub-line: *"three pillars, one warrior"*.
- Pillar crest glyphs: Soul = flame, Body = figure in motion, Mind = lightbulb-like head. Inline SVG in `PersonaTicket.tsx`.

### Map — what I took from `mapexm.jpg`, and what I didn't
- Took: bottom-to-top winding trail, numbered stones, reached = lit / unreached = dim + lock, dashed unreached connectors vs solid lit trail, chapter header with a progress count, the current stone pulses.
- Deliberately not: painted terrain, chests/currency/timer HUD, castles/shields, any art assets. Board is a subtle vignette + faint concentric rings in tokens only.

### Milestones (`lib/map/milestones.ts`) — all placeholder
| # | Name | Meaning | Reward | State |
|---|---|---|---|---|
| I | The Commitment | You decided, with immense seriousness, who you are becoming. | Your road is opened. +50 XP | reached |
| II | First Silence | Ten minutes of stillness, seven days in a row. | Meditation anchor engraved. +100 XP | reached |
| III | The Written Rules | Your must-avoids and must-haves exist on paper… | Life Rules card unlocked. +120 XP | reached (current) |
| IV | Thirty Dawns | A 30-day streak without a broken chain. | Streak shield: one free miss. +200 XP | locked |
| V | The Wikipedia Entry | Your future biography written as fact and read aloud. | Biography sigil. +150 XP | locked |
| VI | Body of Iron | Ninety training sessions logged. | Kinetic crest. +300 XP | locked |
| VII | The Quiet Mind | One hundred hours of silence accumulated. | Alchemist's flame. +300 XP | locked |
| VIII | Half-Year Reckoning | Two quarterly reflections completed and acted upon. | Reflection seal. +400 XP | locked |
| IX | The Architect's Plan | A one-year system built, tested and running without you. | Architect crest. +500 XP | locked |
| X | 2027:00 | The year ends and you are who you decided to be. | The Enlightened One. +1000 XP | locked |
- Stone engraving = Roman numerals. Chapter label: *"Chapter I · Mission Zero"*; title: *"The Road to 2027"*; sheet section labels: *"What it marks"* / *"What it grants"*.
- Reached dates are fake (Aug 20/24/25 2026) purely so the sheet shows the "Reached on …" line.
- XP amounts in rewards are decorative; they are not granted.

### Side fix outside the brief (worth knowing)
- `components/ui/Sheet.tsx` now portals to `document.body`. Before, every bottom sheet (milestone, journal composer, task sheets…) rendered inside `<main>`'s stacking context and was covered by the bottom nav. Behaviour otherwise identical.

## Deferred — needs your green light (data migration, not styling)
You described the hexagon as **Body → {Strength, Health}, Soul → {Consciousness, Will}, Mind → {Knowledge, Capabilities}**.
The live enum is `DOMAINS = ["body","mind","spirit","relationships","finance","purpose"]` (`lib/domain/types.ts:14`, a frozen contract) and it is persisted in every `XpEvent.domain` and `Task.domain` row in Supabase. Renaming breaks stored XP unless migrated.

Proposed mapping (for discussion):
| New axis | Pillar | Old domain to migrate from |
|---|---|---|
| strength | Body | body |
| health | Body | (new — or split from body) |
| consciousness | Soul | spirit |
| will | Soul | purpose |
| knowledge | Mind | mind |
| capabilities | Mind | finance? / relationships? (no clean home — decide) |

Files that consume `DOMAINS` and would change (7 + data):
1. `components/chart/Hexagon.tsx` (axis order + labels)
2. `components/dashboard/QuarterlyFocusPanel.tsx`
3. `components/dashboard/AddTaskSheet.tsx`
4. `components/journal/EntryComposer.tsx`
5. `components/onboarding/steps/FirstPracticeStep.tsx`
6. `lib/game/domains.ts`
7. `lib/domain/seeds.ts` (seed tasks' domains)
- plus `messages/*.json` `domains.*` labels, `supabase/schema.sql` `domain` enum, and a SQL migration remapping existing `xp_events.domain` / `tasks.domain` values.

## Unsure about
- Whether "Kinetic" should read identically for both warriors (I copied the same title/essence) or get distinct prose.
- Whether the Map should also show the warrior's live level/XP somewhere (I left it purely milestone-driven so it doesn't compete with the Dashboard).
- Whether locked stones should be tappable (they are, and the sheet says "Not yet") or inert.
