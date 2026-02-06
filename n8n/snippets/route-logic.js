// 🔀 Route Logic v9 — Исправлен баг: /start сбрасывает онбординг независимо от step

const mergeVoice = $('🔀 Merge Voice').item.json;
const user = $('🔀 Merge User').item.json;
const state = $json;

const isCallback = !!mergeVoice.callback_query;
const callbackData = mergeVoice.callback_query?.data || '';
const text = mergeVoice.message?.text || '';
const chatId = mergeVoice.message?.chat?.id || mergeVoice.callback_query?.message?.chat?.id;

const step = state?.onboarding_step || 0;
const awaitingReport = state?.awaiting_report || false;
const isStart = text === '/start';
const isSlide = text === '/slide';
const isTask = /^(\/task|задание|текущее задание)/i.test(text);
const isProgress = /^(\/progress|прогресс)/i.test(text);

let route = 'deepseek';
let userMessage = text;

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
else if (awaitingReport && text && text.length > 0) {
  // Пользователь пишет отчёт
  route = 'save_report';
}
else if (!user.onboarded) {
  if (isStart) {
    // При /start ВСЕГДА начинаем онбординг с начала, независимо от step
    route = 'show_hook';
  } else if (step === 1) {
    route = 'save_name';
  } else if (step === 2) {
    route = 'save_slide_place';
  } else if (step === 3) {
    route = 'save_slide_people';
  } else if (step === 4) {
    route = 'save_slide_feeling';
  } else if (step === 5) {
    route = 'show_slide_confirm';
  }
}
else {
  if (isStart) {
    route = 'welcome_back';
  } else if (isSlide) {
    route = 'show_slide';
  } else if (isTask) {
    route = 'show_full_task_msg';
  } else if (isProgress) {
    route = 'show_course_progress';
  }
}

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
