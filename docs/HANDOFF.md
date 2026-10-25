# Project handoff

## Current state

- Planning phases 0 through 6 are complete.
- Milestone M0 (Foundation) is complete.
- Milestone M1 (Mochi character, idle behavior, compact variant, and developer
  gallery) is implemented and awaiting founder approval and the Galaxy A51
  measurement.
- The application root currently presents one idle Mochi. The developer gallery
  is available at `#gallery`; its Motion preset control compares written-spec
  timing with the reference HTML timing.
- M2 and later work (stage, mic indicator, captions, voice, Supabase, and
  conversation logic) has not started.

## How to read the docs

Start with [`00_VISION.md`](./00_VISION.md) for product intent and approved
decisions. Use [`06_SCOPE_AND_ARCHITECTURE.md`](./06_SCOPE_AND_ARCHITECTURE.md)
as the current scope and architecture source, [`03_CHARACTER_MOTION_SPEC.md`](./03_CHARACTER_MOTION_SPEC.md)
for approved character behavior, and [`04_DESIGN_SYSTEM.md`](./04_DESIGN_SYSTEM.md)
for visual rules. The approved HTML visual reference is
[`design/mochi-states.html`](./design/mochi-states.html); token source files are
[`design/tokens.css`](./design/tokens.css) and
[`../src/styles/tokens.css`](../src/styles/tokens.css). For the phone preview,
follow [`design/m1-device-testing.md`](./design/m1-device-testing.md).
`ARCHITECTURE.md` is retained for history and is superseded.

## Milestone approval

Each milestone requires the founder's review and approval before the next
milestone starts. Keep changes limited to the currently approved milestone.
M1 is awaiting approval and device measurement; do not begin M2 until the
founder approves M1.
