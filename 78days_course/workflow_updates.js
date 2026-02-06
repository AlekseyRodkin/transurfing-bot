// =====================================================
// ROUTE LOGIC - новый код (добавить course детекцию)
// =====================================================

const routeLogicCode = `
const mergeVoice = $('🔀 Merge Voice').item.json;
const user = $('🔀 Merge User').item.json;
const state = $json;
const text = mergeVoice.message?.text || '';
const step = state?.onboarding_step || 0;
const isStart = text === '/start';
const isSlide = text === '/slide';
const isSettings = text === '/settings';
const isNotifications = text === '/notifications';
const isStats = text === '/stats';

// ========== ДЕТЕКЦИЯ КОМАНД КУРСА ==========
const isCourse = text === '/course';
const isCourseStart = /^(начать курс|старт курс|хочу курс)/i.test(text);
const isCourseTask = /^(задание|текущее задание|мо[её] задание)/i.test(text);
const isCourseProgress = /^(прогресс|мой прогресс|статус курса)/i.test(text);
// ===========================================

// ========== ДЕТЕКЦИЯ КОМАНД ВРЕМЕНИ ==========
const morningChangeMatch = text.match(/^утро\\s+(\\d{1,2}[:\\.]?\\d{0,2}|выкл)/i);
const eveningChangeMatch = text.match(/^вечер\\s+(\\d{1,2}[:\\.]?\\d{0,2}|выкл)/i);
// =============================================

// ========== OFF-TOPIC FILTER ==========
const offTopicPatterns = [
  /погода/i,
  /какая температура/i,
  /сколько будет \\d/i,
  /\\d\\s*[\\+\\-\\*\\/]\\s*\\d/,
  /расскажи анекдот/i,
  /что такое (python|javascript|программирование|php|java|html|css|react)/i,
  /новости/i,
  /курс (доллара|евро|валют|биткоин)/i,
  /кто президент/i,
  /столица/i,
  /переведи/i,
  /как сказать на/i,
  /напиши (код|программу|скрипт)/i,
  /реши (задачу|уравнение|пример)/i,
];
const isOffTopic = offTopicPatterns.some(p => p.test(text));
// ======================================

let route = 'deepseek';

// Off-topic проверяем ПЕРВЫМ для onboarded пользователей
if (isOffTopic && user.onboarded && !isStart && !isSlide && !isSettings && !isNotifications && !isStats && !isCourse && !isCourseStart && !isCourseTask && !isCourseProgress) {
  route = 'off_topic_redirect';
} else if (isCourse && user.onboarded) {
  route = 'show_course_menu';
} else if (isCourseStart && user.onboarded) {
  route = 'start_course';
} else if (isCourseTask && user.onboarded) {
  route = 'show_course_task';
} else if (isCourseProgress && user.onboarded) {
  route = 'show_course_progress';
} else if (isSlide && user.onboarded) {
  route = 'show_slide';
} else if (isSettings && user.onboarded) {
  route = 'show_settings';
} else if (isNotifications && user.onboarded) {
  route = 'show_notifications';
} else if (isStats && user.onboarded) {
  route = 'show_stats';
} else if (morningChangeMatch && user.onboarded) {
  route = 'change_morning_time';
} else if (eveningChangeMatch && user.onboarded) {
  route = 'change_evening_time';
} else if (isStart && step === 0) {
  route = 'ask_name';
} else if (step === 1) {
  route = 'save_name';
} else if (step === 2) {
  route = 'save_style';
} else if (step === 3) {
  route = 'save_slide';
} else if (step === 4) {
  route = 'save_morning_time';
} else if (step === 5) {
  route = 'save_evening_time';
} else if (isStart && user.onboarded) {
  route = 'welcome_back';
}

return {
  route: route,
  user_id: user.id,
  telegram_chat_id: mergeVoice.message.chat.id,
  user_message: text,
  user: user,
  state: state,
  trigger: mergeVoice
};
`;


// =====================================================
// ONBOARDING HANDLER - добавить course cases
// =====================================================

const courseHandlerCases = `
  // ========== COURSE CASES ==========

  case 'show_course_menu':
    const courseMenuName = data.user?.preferred_name || data.user?.first_name || 'друг';
    message = \`📚 Курс "78 дней с Трансерфингом", \${courseMenuName}!

Это интенсивная программа погружения в практику Трансерфинга. Каждый день — новое задание и осознание.

🎯 Как это работает:
• Ты получаешь задание дня
• Выполняешь его в течение дня
• Пишешь мне отчёт
• Я засчитываю выполнение и открываю следующий день

⏱ Прогресс по факту выполнения, не по времени.

Напиши "начать курс" чтобы начать с Дня 1!\`;
    nextStep = null;
    break;

  case 'start_course':
    const startCourseName = data.user?.preferred_name || data.user?.first_name || 'друг';
    // Флаг для запуска start_course RPC
    startCourseAction = true;
    message = \`🚀 Отлично, \${startCourseName}! Курс начат!

📅 День 1 из 78

Сейчас я пришлю тебе первое задание. Когда выполнишь — напиши мне отчёт, и я открою следующий день.

Удачи на пути! ✨\`;
    nextStep = null;
    break;

  case 'show_course_task':
    const taskName = data.user?.preferred_name || data.user?.first_name || 'друг';
    // Флаг для запроса текущего задания
    getCourseTaskAction = true;
    message = \`📋 Загружаю твоё текущее задание, \${taskName}...\`;
    nextStep = null;
    break;

  case 'show_course_progress':
    const progressName = data.user?.preferred_name || data.user?.first_name || 'друг';
    // Флаг для запроса прогресса
    getCourseProgressAction = true;
    message = \`📊 Загружаю прогресс курса, \${progressName}...\`;
    nextStep = null;
    break;
`;


// =====================================================
// ❓ Onboarding? - новые условия для course routes
// =====================================================

const newOnboardingConditions = [
  { id: "r15", route: "show_course_menu" },
  { id: "r16", route: "start_course" },
  { id: "r17", route: "show_course_task" },
  { id: "r18", route: "show_course_progress" }
];


// =====================================================
// BUILD LLM CONTEXT - добавить course context
// =====================================================

const buildLLMContextAddition = `
// ========== COURSE CONTEXT ==========
// Если пользователь на курсе, добавить контекст задания
// Это будет добавлено позже после получения данных о курсе из БД
// ====================================
`;

console.log("Route Logic Code:", routeLogicCode);
console.log("\nCourse Handler Cases:", courseHandlerCases);
