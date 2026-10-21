# 🍡 Mochi AI — مراجعة Claude وخطة التسليم (Claude → Gemini)

> **رسالة من Claude إلى Gemini (بالنيابة عن محمود):**
> أهلاً يا Gemini! قريت وثيقة `mochi_ai_master_plan.md` كاملة. الفكرة قوية والرؤية واضحة وأنا موافق على الأساس (Voice-First مصري + كاركتر حي + Zero-Cost + PWA + Supabase).
> الوثيقة دي فيها: (1) مراجعتي والتعديلات اللي اقترحتها وليه، (2) الـ Flow الكامل، (3) العقود المشتركة بينا (Contracts)، (4) تقسيم شغل معدّل، (5) أسئلة محتاجة ردك.
> **لا نبدأ كود قبل ما تراجع وتردّ ومحمود يعتمد.**

---

## 1. القرارات المعتمدة من وثيقتك (بدون تغيير)

- React (Vite) + TypeScript + Tailwind + Framer Motion (`motion`) + Zustand.
- PWA أولاً، وTauri/Electron اختياري بعد ما كل حاجة تشتغل.
- Supabase (Postgres + Realtime + RLS) للمزامنة.
- الكاركتر مرسوم بالكود (SVG + CSS) مش صور.
- Milestone 1 = الكاركتر وشاشة البداية بس، ونأخد وقتنا.

## 2. التعديلات والتحسينات المقترحة (مع الأسباب)

| # | التعديل | السبب |
| :-- | :-- | :-- |
| 1 | **مفاتيح Gemini/Groq متتحطش في الـ Frontend أبداً.** الاتصال بالـ AI يعدّي على **Supabase Edge Function** بتحتفظ بالمفتاح. | أي متغير `VITE_*` بيظهر في الـ bundle لأي حد يفتح DevTools. "التشفير المحلي" مش حل لأن التطبيق نفسه محتاج يفك التشفير. والمشروع Open-Source. |
| 2 | **حالة سابعة للكاركتر: `speaking`** (بيتكلم: فم/نبض مرتبط بتردد الصوت). | الوثيقة ذكرت `useAudioAnalyzer` بس مفيش حالة مخصصة للكلام، وده هيعمل تعارض مع `listening` و`idle`. |
| 3 | **TTS و STT ورا Interfaces** (`SpeechProvider` / `RecognitionProvider`) مع fallback. | Edge-TTS endpoint غير رسمي ممكن يتغير، ومحتاج سيرفر وسيط. `webkitSpeechRecognition` ضعيف على Safari/iOS وFirefox. التطبيق لازم يفضل شغال لو واحد وقع (fallback: `speechSynthesis` + إدخال كتابة). |
| 4 | **التايمر يتحسب من الـ Timestamps مش `setInterval`.** نخزن `startedAt` و`plannedMinutes` والباقي بيتحسب منهم. | المتصفح بيخنق الـ timers في التابات الخلفية وعلى الموبايل. لو الحساب بالتراكم هيطلع غلط. |
| 5 | **منطق الجدولة (Rescheduler) في الكود، مش في الـ LLM.** الـ LLM يستخرج النية فقط (intent) والكود ينفّذ بخوارزمية قابلة للاختبار. | الـ LLM مش deterministic، ومينفعش يعدّل جدول اليوم بتخمين. |
| 6 | **أي Action راجع من الـ AI يتعامل كـ "اقتراح"** يتعمله Validation بـ `zod` قبل ما الـ Store ينفذه. | حماية من JSON فاسد أو أوامر غريبة. |
| 7 | **Local-first:** الـ Store يتخزن محلياً (Zustand persist) ويشتغل بدون نت، والـ Supabase Sync يتضاف في Milestone 4. | يبسّط تطوير M1–M3 ويخلي التطبيق سريع. |
| 8 | **تنبيهات الغياب/الـ 50% وهو التطبيق مقفول محتاجة Web Push** (سيرفر + تعقيد + قيود iOS). نعتبرها **مرحلة اختيارية لاحقة**، والتنبيهات في M3 تشتغل والتطبيق مفتوح بس. | عشان منوعدش بحاجة مش مضمونة في الـ Free Stack. |
| 9 | **ملفات Open-Source من اليوم الأول:** `LICENSE` (MIT)، `README.md`، `.env.example`، `.gitignore` فيه `.env`. | الأمان والاحترافية. |
| 10 | **الـ Repo هو الذاكرة المشتركة بيننا:** مجلد `docs/` فيه `MASTER_PLAN.md` و`ARCHITECTURE.md` و`HANDOFF.md` (نحدّثه بعد كل Milestone). | أنا وانت مش بنشوف شغل بعض. أي واحد يبدأ شغل يقرأ الـ `docs/` الأول. |

## 3. الـ Flow الكامل (من أول التطبيق لآخر اليوم)

1. **الفتح:** Mochi في حالة `idle`، يسلّم صوتياً: "أهلاً يا محمود، إيه ورانا النهارده؟"
2. **تحديد اليوم:** محمود يتكلم → `listening` → الـ AI يرجع JSON (رد + action + حالة) → `speaking`.
3. **الرود ماب:** إما يولّد برومبت جاهز للنسخ، أو يلصق الرد، أو التطبيق يقسّمه مباشرة بالـ API → `RoadmapParser` يحوّله لمهام.
4. **الجدولة:** `Scheduler` يوزّع المهام على ساعات اليوم من غير تعارض بين المسارات.
5. **بدء مهمة:** "يلا نبدأ" → Mochi يقول الوقت الفعلي ويشغّل التايمر → `focus` (HUD عائم صغير).
6. **منتصف الوقت (50%):** `alert` + سؤال هادي. محمود يرد صوتياً أو يتجاهل.
7. **انتهاء الوقت:** `alert`. لو محمود غاب → متابعة كل ساعة/ساعتين، والفرق يتسجل للتحليلات.
8. **إنجاز:** `celebrating` + تحديث التقدم في شجرة الرود ماب.
9. **طوارئ/مشوار:** "عندي مشوار 6 لـ 8" → `Rescheduler` يزحزح المهام المتأثرة.
10. **بريك/جمعة:** `sleep`، اليوم متحسبش فشل، والمهام تترحّل.
11. **آخر اليوم:** شاشة التحليلات (نسبة الإنجاز، فعلي مقابل متوقع، الوقت الضائع) + زرار ترحيل المتبقي.

## 4. العقود المشتركة (Contracts) — نثبّتها قبل أي كود

### 4.1 حالات الكاركتر
```ts
type MochiState =
  | 'idle' | 'listening' | 'speaking'
  | 'alert' | 'celebrating' | 'focus' | 'sleep';
```

### 4.2 Props الكاركتر (واجهة Milestone 1 اللي Gemini هيعتمد عليها)
```ts
interface MochiAvatarProps {
  state: MochiState;
  audioLevel?: number;      // 0..1 للتفاعل مع الصوت (Gemini يغذّيها لاحقاً)
  size?: 'full' | 'mini';   // mini = Focus HUD
  className?: string;
}
```

### 4.3 رد الـ AI (يتحقق منه `zod`)
```json
{
  "reply": "الرد بالمصري",
  "mochi_state": "idle | listening | speaking | alert | celebrating | focus | sleep",
  "action": { "type": "none | start_task | complete_task | add_errand | set_break_mode | add_roadmap", "payload": {} }
}
```

### 4.4 نموذج البيانات (مسودة — كلها عليها RLS: `auth.uid() = user_id`)
- `roadmaps` (id, user_id, title, category, status)
- `roadmap_items` (id, roadmap_id, user_id, title, est_minutes, position, status)
- `schedule_blocks` (id, user_id, item_id?, kind: task|errand|break, start_at, end_at, status)
- `task_sessions` (id, user_id, block_id, started_at, ended_at, planned_min, actual_min, checkins jsonb)
- `voice_notes` (id, user_id, item_id, text, created_at)
- `day_logs` (id, user_id, date, mode: normal|break, summary jsonb)

## 5. هيكل المشروع المقترح

```
mochi-ai/
├── docs/                 ← MASTER_PLAN / ARCHITECTURE / HANDOFF
├── src/
│   ├── components/
│   │   ├── mochi/        ← MochiAvatar, MochiFace, MochiBadge, MochiParticles
│   │   └── stage/        ← HeroStage (M1)، ثم Today/Roadmap/Analytics لاحقاً
│   ├── hooks/            ← useMochiAutonomousBehavior, useAudioAnalyzer
│   ├── services/         ← (M2) SpeechProvider, RecognitionProvider, BrainService
│   ├── store/            ← (M2) useMochiStore
│   ├── domain/           ← (M3) RoadmapParser, Scheduler, Rescheduler (منطق صافي + اختبارات)
│   └── types/            ← mochi.ts, ai.ts
├── supabase/             ← (M4) migrations + edge functions + RLS
├── .env.example · LICENSE · README.md
```

## 6. تقسيم الشغل المعدّل

**المبدأ:** كل Milestone يتبني كامل عند واحد فينا، ومننقسمش جوه الـ Milestone الواحد. التسليم بين الـ Milestones بيتم عن طريق العقود في القسم 4 وملف `docs/HANDOFF.md`.

| Milestone | المنفّذ | المراجع |
| :-- | :-- | :-- |
| **M1** الكاركتر + الحركة الذاتية + HeroStage | **Claude** (كامل، بما فيه `useMochiAutonomousBehavior`) | Gemini يراجع |
| **M2** الصوت المصري + عقل الـ AI + الـ Store + واجهة المحادثة | **Gemini** (الخدمات والـ Edge Function) + **Claude** (واجهة الصوت) | تبادلي |
| **M3** الرود ماب + اليوم + التايمر + إعادة الجدولة | **Gemini** (الـ domain logic + اختبارات) + **Claude** (الواجهات) | تبادلي |
| **M4** التحليلات + الملاحظات + Supabase/RLS + PWA | **Gemini** (Supabase/RLS/Sync) + **Claude** (واجهات التحليلات) | تبادلي |

> ملاحظة: `useAudioAnalyzer` تتأجل لـ M2 لأنها محتاجة الصوت أصلاً. في M1 الكاركتر بياخد `audioLevel` كـ prop ويتجرّب بقيمة يدوية.

## 7. تفصيل Milestone 1 (خطوات صغيرة، كل خطوة ليها نقطة تأكيد)

| الخطوة | المحتوى | نقطة التأكيد (Done when) |
| :-- | :-- | :-- |
| 1.1 | إنشاء المشروع + Tailwind + Git + ملفات الـ Open-Source + `docs/` | `npm run dev` يشتغل |
| 1.2 | `types/mochi.ts` + شاشة تجربة بأزرار تبدّل الحالات الـ 7 | الأزرار تغيّر state |
| 1.3 | جسم Mochi: شكل Squircle ثلاثي الأبعاد + إضاءة + ظل | شكل ناعم ومقنع في الوضع `idle` |
| 1.4 | الوجه: عيون، رمش، غمزة، خدود لكل حالة | كل حالة ليها وجه مميز |
| 1.5 | الشارات + الإضاءات الملونة + النجوم | الحالات الـ 7 تبان صح |
| 1.6 | الحركة الذاتية: تنفس، طفو، رمش عشوائي، نظرات، تتبع الماوس بـ Spring | الكاركتر "حي" بدون أي تدخل |
| 1.7 | `HeroStage` النظيفة + الأداء + `prefers-reduced-motion` + مراجعة Gemini | 60fps وتمرير المراجعة |

## 8. أسئلة محتاجة ردك يا Gemini

1. هل توافق على إضافة حالة `speaking` وعلى شكل الـ `MochiAvatarProps` في 4.2؟
2. هل عندك اعتراض على نقل المفتاح لـ Edge Function وعلى تأجيل Web Push؟
3. هل في حقول ناقصة في نموذج البيانات (4.4) من وجهة نظرك؟
4. ممكن تكتب لنا في M2 تصوّر لسيرفر Edge-TTS المصري (محلي للابتوب، وبديل للموبايل)؟
5. أي ملاحظات على تقسيم M1 (القسم 7) قبل ما نبدأ؟

---
*(بعد ردك، محمود هيعتمد الخطة النهائية، وبعدها نبدأ الخطوة 1.1.)*
