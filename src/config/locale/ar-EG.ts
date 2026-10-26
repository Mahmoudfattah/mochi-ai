const arEG = {
  appName: "{{persona_name}}",
  characterAccessibleName: "شخصية {{persona_name}}",
  touchToTalk: "المس {{persona_name}} عشان تبدأ تتكلم معاه",
  firstVisitTypingHint: "⌨️ أو اكتب لو مش حابب تستخدم الصوت",
  microphoneOff: "المايك متوقف",
  microphoneOffAction:
    "حالة المايك: متوقف، المس {{persona_name}} لبدء الاستماع",
  microphoneWaiting: "مطلوب إذن المايك",
  microphoneWaitingAction:
    "حالة المايك: مطلوب إذن المايك، اختر سماح من شريط الأدوات",
  microphoneListening: "بيسمعك • إيقاف",
  microphoneListeningAction: "حالة المايك: بيسمعك، اضغط لإيقافه",
  microphoneFollowUp: "متابعة (5ث) • إيقاف",
  microphoneFollowUpAction: "حالة المايك: نافذة متابعة نشطة، اضغط لإيقافها",
  microphonePaused: "متوقف مؤقتاً • استئناف",
  microphonePausedAction: "حالة المايك: متوقف مؤقتاً، اضغط للاستئناف",
  microphoneUnavailable: "الصوت مقفول • اكتب",
  microphoneUnavailableAction: "حالة المايك: الصوت غير متاح، اضغط للكتابة",
  microphoneSymbolOff: "○",
  microphoneSymbolListening: "●",
  microphoneSymbolFollowUp: "◐",
  microphoneSymbolPaused: "■",
  microphoneSymbolPermission: "▲",
  microphoneSymbolUnavailable: "✕",
  permissionExplanation:
    "محتاج إذن المايك عشان أسمعك. تقدر تكمّل بالكتابة لو حابب.",
  waitingForPermission: "مستني إذن المايك",
  permissionDeniedMessage:
    "إذن المايك مقفول حالياً من إعدادات المتصفح. تقدر تكمّل بالكتابة دلوقتي، أو تفتح الإذن ونجرّب تاني.",
  permissionHelpTitle: "🔧 إزاي تفتح إذن المايك؟ (خطوات سريعة)",
  permissionHelpChromeAndroid:
    "Chrome على أندرويد: اضغط علامة الضبط أو القفل جنب عنوان الصفحة، ثم الأذونات، وفعّل الميكروفون.",
  permissionHelpSamsungInternet:
    "Samsung Internet: افتح القائمة، ثم إعدادات الموقع، ثم الميكروفون، واسمح للموقع.",
  permissionHelpChromeWindows:
    "Chrome على ويندوز: اضغط أيقونة القفل أو الإعدادات جنب الرابط، وفعّل الميكروفون.",
  continueByTyping: "⌨️ كمّل بالكتابة دلوقتي",
  retry: "🔄 إعادة المحاولة",
  offlineMessage:
    "مفيش اتصال بالإنترنت أو الخدمة متوقفة مؤقتاً دلوقتي. تقدر تكمّل بالكتابة لحد ما ترجع.",
  speechNotUnderstood: "مش متأكد إني فهمتك صح… تعيدها بطريقة تانية؟",
  speechError: "حصلت مشكلة في التقاط الكلام. جرّب تاني أو كمّل بالكتابة.",
  speechErrorRetry: "حصلت مشكلة في التقاط الكلام. جرّب تاني.",
  speechOutputError:
    "الرد ظاهر قدامك، بس الصوت ما اشتغلش. تقدر تعيد المحاولة أو تكمّل بالكتابة.",
  serviceError:
    "حصلت مشكلة مؤقتة في الخدمة. تقدر تكمّل بالكتابة أو تجرّب تاني.",
  interimTranscript: "جاري التقاط كلامك (مؤقت ولا يُحفظ خام)",
  userReply: "تمام، فهمت طلبك. خلّينا نبدأ بخطوة واحدة واضحة.",
  userReplyAlternate: "حاضر. نرتبها واحدة واحدة ونختار أهم خطوة دلوقتي.",
  userReplyNext: "تمام، نبدأ بالمهمة دي ونراجع باقي الخطوات بعدها.",
  shortReply: "تمام، نبدأ واحدة واحدة؟",
  longReply:
    "تمام. خلّينا نبدأ بخطوة واحدة واضحة بدل ما نزحم اليوم. بعد كده نراجع الـ API integration ونختار وقت مناسب للـ deploy. لو تحب، نكمّل سوا ونرتّب باقي الخطوات واحدة واحدة.",
  speakingHint: "المس {{persona_name}} لو حابب تقاطعه",
  thinking: "بفكر في طلبك",
  interrupted: "وقفت الرد. قولّي تحب نعمل إيه؟",
  followUpHint: "تقدر تضيف حاجة دلوقتي",
  closeTyping: "إغلاق الكتابة",
  exitRecovery: "رجوع للشاشة الرئيسية",
  typingPlaceholder: "اكتب اللي تحب تقوله",
  typingPrompt:
    "المايك متوقف دلوقتي عشان تاخد راحتك. اكتب اللي تحبه وهرد عليك هنا.",
  typingLabel: "اكتب أمرك لـ {{persona_name}}",
  typingSend: "إرسال",
  correction: "✎ تصحيح",
  stateIdle: "{{persona_name}} جاهز لما تحب تبدأ",
  stateWaitingPermission: "مستني إذن المايك",
  stateListening: "بيسمعك",
  stateHearingSpeech: "جاري التقاط كلامك",
  stateThinking: "بفكر في طلبك",
  stateSpeaking: "{{persona_name}} بيرد",
  stateFollowUpWindow: "نافذة المتابعة شغالة",
  statePausedMuted: "المايك متوقف مؤقتاً",
  stateInterrupted: "الرد اتوقف",
  stateError: "فيه مشكلة محتاجة انتباهك",
  stateOffline: "الخدمة غير متاحة مؤقتاً",
  toolbarToggle: "أدوات التجربة",
  toolbarTitle: "أدوات التجربة",
  permissionGrant: "سماح بالمايك",
  permissionDeny: "رفض الإذن",
  permissionRevoke: "إلغاء الإذن",
  toolbarSampleLabel: "نص الكلام التجريبي",
  toolbarSimulateSpeech: "محاكاة كلام",
  toolbarRecognitionError: "محاكاة خطأ في التعرف",
  toolbarServiceError: "محاكاة خطأ في الخدمة",
  toolbarGoOffline: "فصل الاتصال",
  toolbarGoOnline: "عودة الاتصال",
  toolbarLongReply: "رد طويل",
  toolbarCurrentState: "الحالة الحالية: {{state}}",
  toolbarTranscript: "عايز أراجع الـ API integration قبل اجتماع الساعة 2",
  stateNameIdle: "نايم",
  stateNameWaitingPermission: "مستني الإذن",
  stateNameListening: "بيسمع",
  stateNameHearingSpeech: "بيسمع الكلام",
  stateNameThinking: "بيفكر",
  stateNameSpeaking: "بيرد",
  stateNameFollowUpWindow: "متابعة",
  stateNamePausedMuted: "متوقف مؤقتاً",
  stateNameInterrupted: "الرد اتقطع",
  stateNameError: "مشكلة",
  stateNameOffline: "الخدمة مش متاحة",
  serviceOfflineNotice: "الخدمة مش متاحة، والمايك {{mic_state}}",
  micActuallyActive: "شغال",
  micActuallyOff: "متوقف",
  captionOverflow: "الرد طويل؛ هنعرضه بالكامل في طبقة لاحقاً.",
  longReplyCaption:
    "تمام. خلّينا نبدأ بخطوة واحدة واضحة بدل ما نزحم اليوم. بعد كده نراجع الـ API integration…",
  devOnlyBadge: "عرض تجريبي",
} as const;

export type LocaleKey = keyof typeof arEG;
export type LocaleVariables = Record<string, string | number>;

export function t(key: LocaleKey, vars: LocaleVariables = {}): string {
  return Object.entries(vars).reduce(
    (message, [name, value]) =>
      message.replaceAll(`{{${name}}}`, String(value)),
    arEG[key] as string,
  );
}

export default arEG;
