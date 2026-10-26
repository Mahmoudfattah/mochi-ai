# Project handoff

## Current state

- Planning phases 0 through 6 are complete.
- Milestone M0 (Foundation) is complete.
- Milestone M1 (Mochi character, idle behavior, compact variant, and developer
  gallery) is implemented. The Galaxy A51 measurement remains a device check.
- Milestone M2 (mock-driven session flow, main stage, mic indicator, captions,
  typing fallback, recovery cards, lifecycle handling, and Demo toolbar) is
  implemented and awaiting founder approval.
- The root path presents the stage. The M1 developer gallery remains available
  at `#gallery`.
- The stage uses mock permission, recognition, speech, and conversation
  providers only. It does not access a real microphone or call a real service.
- Re-measure the stage on a Samsung Galaxy A51 using the production build before
  approving M2. Follow [`design/m2-journey-checklist.md`](./design/m2-journey-checklist.md)
  and use the frame-rate probe available in the gallery.

## How to read the docs

Start with [`00_VISION.md`](./00_VISION.md) for product intent and approved
decisions. Use [`06_SCOPE_AND_ARCHITECTURE.md`](./06_SCOPE_AND_ARCHITECTURE.md)
as the current scope and architecture source, [`02_UX_JOURNEY.md`](./02_UX_JOURNEY.md)
for user journeys and session transitions, [`03_CHARACTER_MOTION_SPEC.md`](./03_CHARACTER_MOTION_SPEC.md)
for approved character behavior, and [`04_DESIGN_SYSTEM.md`](./04_DESIGN_SYSTEM.md)
for visual rules. The approved HTML visual references are
[`design/mochi-states.html`](./design/mochi-states.html) and
[`design/mochi-screens.html`](./design/mochi-screens.html). Token source files
are [`design/tokens.css`](./design/tokens.css) and
[`../src/styles/tokens.css`](../src/styles/tokens.css).

For a manual Demo-mode walk-through, use
[`design/m2-journey-checklist.md`](./design/m2-journey-checklist.md). For the
M1 character preview on a phone, follow
[`design/m1-device-testing.md`](./design/m1-device-testing.md).
`ARCHITECTURE.md` is retained for history and is superseded.

## Milestone approval

Each milestone requires the founder's review and approval before the next
milestone starts. Keep changes limited to the currently approved milestone.
M2 is awaiting founder approval and the production-build Galaxy A51 measurement.
