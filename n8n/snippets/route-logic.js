// 🔀 Route Logic v10 — Фикс: команды имеют приоритет над awaiting_report

const mergeVoice = $('🔀 Merge Voice').item.json;
const user = $('🔀 Merge User').item.json;
const state = $json;

const isCallback = !!mergeVoice.callback_query;
const callbackData = mergeVoice.callback_query?.data || '';
const text = mergeVoice.message?.text || '';
const chatId = mergeVoice.message?.chat?.id || mergeVoice.callback_query?.message?.chat?.id;

const step = state?.onboarding_step || 0;
const awaitingReport = state?.awaiting_report || false;
const isCommand = text?.startsWith('/');
const isStart = text === '/start';
const isSlide = text === '/slide';
const isTask = /^(\/task|задание|текущее задание)/i.test(text);
const isProgress = /^(\/progress|прогресс)/i.test(text);

let route = 'deepseek';
let userMessage = text;

// 1. Callback — всегда первый приоритет
if (isCallback) {
  const callbackRoutes = {
    'onb_explanation': 'show_explanation',
    'onb_value': 'show_value',
    'onb_name': 'ask_name',
    'emoji_minimal': 'save_emoji_minimal',
    'emoji_moderate': 'save_emoji_moderate',
    'emoji_many': 'save_emoji_many',
    'onb_slide_place': 'ask_slide_place',
    'slide_save': 'save_final_slide',
    'slide_rewrite': 'rewrite_slide',
    'show_full_task': 'show_full_task_msg',
    'ask_question': 'prompt_question',
    'report': 'ask_for_report'
  };
  route = callbackRoutes[callbackData] || 'unknown_callback';
}
// 2. Команды — всегда выше awaiting_report и онбординга
else if (isStart) {
  route = !user.onboarded ? 'show_hook' : 'welcome_back';
}
else if (isSlide) {
  route = 'show_slide';
}
else if (isTask) {
  route = 'show_full_task_msg';
}
else if (isProgress) {
  route = 'show_course_progress';
}
// 3. Отчёт — только свободный текст (не команда) при awaiting_report
else if (awaitingReport && text?.trim() && !isCommand) {
  route = 'save_report';
}
// 4. Онбординг — шаги для не-онбордированных
else if (!user.onboarded) {
  if (step === 1) {
    route = 'save_name';
  } else if (step === 2) {
    route = 'save_slide_place';
  } else if (step === 3) {
    route = 'save_slide_people';
  } else if (step === 4) {
    route = 'save_slide_feeling';
  } else if (step === 5) {
    route = 'show_slide_confirm';
  } else if (step === 10) {
    // Ожидание подтверждения слайда — текст игнорируется, ждём кнопку
    route = 'waiting_slide_confirm';
  }
}
// 5. Свободный текст → DeepSeek (default)

return {
  route: route,
  user_id: user.id,
  telegram_chat_id: chatId,
  user_message: userMessage,
  callback_data: callbackData,
  is_callback: isCallback,
  user: user,
  state: state,
  trigger: mergeVoice,
  awaiting_report: awaitingReport
};
