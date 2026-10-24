> SUPERSEDED by 06_SCOPE_AND_ARCHITECTURE.md. Kept for history.

# Mochi AI — Architecture (Locked Contracts v1.0)

Agreed by: Mahmoud + Claude + Gemini.

## Stack
React + Vite + TypeScript + Tailwind CSS + Motion (Framer Motion) + Zustand + Zod + Supabase.
PWA first. Tauri/Electron optional later. Local-first (Zustand persist), Supabase sync in M4.

## Security rules
- API keys (Gemini / Groq) NEVER in the frontend. AI calls go through a Supabase Edge Function.
- `.env` is never committed. Only `.env.example` is.
- RLS on every table: `auth.uid() = user_id`.

## Mochi states (7)
```ts
export type MochiState =
  | 'idle' | 'listening' | 'speaking'
  | 'alert' | 'celebrating' | 'focus' | 'sleep';
```
`wink` and head-tilt are autonomous micro-expressions inside `idle` / `celebrating`, not states.

## MochiAvatar props
```ts
export interface MochiAvatarProps {
  state: MochiState;
  audioLevel?: number;      // 0..1, fed by the audio analyzer in M2
  size?: 'full' | 'mini';   // mini = Focus HUD
  onInteract?: () => void;  // direct tap on Mochi
  className?: string;
}
```

## AI response contract (validated with Zod before use)
```json
{
  "reply": "Egyptian Arabic reply",
  "mochi_state": "idle | listening | speaking | alert | celebrating | focus | sleep",
  "action": { "type": "none | start_task | complete_task | add_errand | set_break_mode | add_roadmap", "payload": {} }
}
```
AI actions are proposals. Domain code (Scheduler / Rescheduler) executes them, never the LLM.

## Data model (draft) — every table has `user_id`, `updated_at timestamptz default now()`
- roadmaps (id, title, category, status)
- roadmap_items (id, roadmap_id, title, est_minutes, position, status, resource_url?, day_number?)
- schedule_blocks (id, item_id?, kind task|errand|break, start_at, end_at, status, original_start_at, rescheduled_count default 0)
- task_sessions (id, block_id, started_at, ended_at, planned_min, actual_min, overtime_min default 0, checkins jsonb)
- voice_notes (id, item_id, text, created_at)
- day_logs (id, date, mode normal|break, summary jsonb)

## Speech
- `SpeechProvider`: EdgeNeuralTTSProvider (ar-EG-ShakirNeural / SalmaNeural) via dev middleware locally and Edge Function in production.
- Fallback: use a browser Arabic voice only if one exists; otherwise a Mochi chime + text bubble. Never read Arabic with an English voice.
- `RecognitionProvider`: webkitSpeechRecognition (ar-EG) with a typed-input fallback.

## Timer rule
Store `startedAt` + `plannedMinutes`; compute remaining time from timestamps, never by counting `setInterval` ticks.

## Folder structure
```
docs/  src/{components/{mochi,stage},hooks,services,store,domain,types}  supabase/
```

## Ownership
M1 Claude (all) · M2 Gemini services + Claude voice UI · M3 Gemini domain + Claude UI · M4 Gemini Supabase/RLS + Claude analytics UI.
