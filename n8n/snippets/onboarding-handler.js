// 🎯 Onboarding Handler v15 — Фиксы: slide preview=save, step после превью, answerCallbackQuery

const data = $json;
const route = data.route;
const userName = data.user?.preferred_name || data.user?.first_name || '';

let message = '';
let nextStep = null;
let saveName = null;
let saveStyle = null;
let saveSlidePlace = null;
let saveSlidePeople = null;
let saveSlideFeeling = null;
let saveFinalSlide = null;
let startCourseAction = false;
let inlineKeyboard = null;
let showFullTask = false;
let setAwaitingReport = false;
let saveReportData = null;

switch (route) {
  case 'show_hook':
    message = '✨ А что, если реальность — это не то, что с тобой происходит, а то, что ты сам выбираешь?\n\nЗвучит красиво, но обычно — пустые слова.\n\n🔮 78 дней — и ты проверишь на практике.';
    inlineKeyboard = [[{text: '👉 Интересно, расскажи', callback_data: 'onb_explanation'}]];
    nextStep = 0;
    break;

  case 'show_explanation':
    message = '🔮 Трансерфинг — система управления реальностью. Не магия, не аффирмации, не "думай позитивно".\n\n🪞 Суть: мир — как зеркало. Показываешь страх — получаешь страшное. Показываешь спокойную уверенность — получаешь желаемое.\n\n📚 За 78 дней освоишь конкретные инструменты: как снижать важность, как работать с целью, как не кормить чужие "маятники" энергией.';
    inlineKeyboard = [[{text: '🎯 Что я получу через 78 дней?', callback_data: 'onb_value'}]];
    break;

  case 'show_value':
    message = '🎯 Через 78 дней у тебя будет:\n\n✅ Чёткая картина желаемого будущего\n✅ Способность замечать, когда мир реагирует на мысли\n✅ Набор техник для сложных ситуаций\n✅ Спокойная уверенность вместо тревоги\n\n📅 Каждый день — одна практика. Не теория, а действие.';
    inlineKeyboard = [[{text: '🚀 Начинаем', callback_data: 'onb_name'}]];
    break;

  case 'ask_name':
    message = '🤝 Отлично. Я буду твоим проводником на эти 78 дней.\n\n💬 Как тебя зовут?';
    nextStep = 1;
    break;

  case 'save_name':
    saveName = data.user_message.trim();
    message = `👋 Приятно познакомиться, ${saveName}!\n\n🎨 Как тебе комфортнее общаться?`;
    inlineKeyboard = [
      [{text: '📝 Минимум эмодзи', callback_data: 'emoji_minimal'}],
      [{text: '😊 Умеренно', callback_data: 'emoji_moderate'}],
      [{text: '🎉 Много эмодзи!', callback_data: 'emoji_many'}]
    ];
    nextStep = 1;
    break;

  case 'save_emoji_minimal':
  case 'save_emoji_moderate':
  case 'save_emoji_many':
    saveStyle = route.replace('save_emoji_', '');
    const nameForSlide = data.user?.preferred_name || data.user?.first_name || 'друг';
    message = `🎬 ${nameForSlide}, главный инструмент курса — картинка твоего желаемого будущего.\n\n💭 Не абстрактная мечта, а конкретный образ: что ты видишь, когда цель достигнута? Где находишься? Кто рядом?\n\n🔄 Эту картинку нужно "крутить" в голове. Как кино от первого лица, где всё уже случилось.\n\n🎯 Мы называем это "целевой слайд".`;
    inlineKeyboard = [[{text: '✨ Понятно, создаём слайд', callback_data: 'onb_slide_place'}]];
    break;

  case 'ask_slide_place':
    message = '🌟 Представь: прошло время, ты достиг того, чего хочешь больше всего.\n\n👀 Что ты ВИДИШЬ вокруг?\n📍 Где находишься? Какое это место?';
    nextStep = 2;
    break;

  case 'save_slide_place':
    saveSlidePlace = data.user_message;
    message = '👥 Кто рядом с тобой в этой картине?\n🎬 Что ты делаешь в этот момент?';
    nextStep = 3;
    break;

  case 'save_slide_people':
    saveSlidePeople = data.user_message;
    message = '💫 Что ты ЧУВСТВУЕШЬ?\n💖 Какие эмоции, ощущения в теле?';
    nextStep = 4;
    break;

  case 'save_slide_feeling':
    saveSlideFeeling = data.user_message;
    nextStep = 5;
    break;

  case 'show_slide_confirm':
    const confirmPlace = data.state?.slide_place || '';
    const confirmPeople = data.state?.slide_people || '';
    const confirmFeeling = data.state?.slide_feeling || '';
    const fullSlide = `${confirmPlace}\n\nРядом: ${confirmPeople}\n\nЧувствую: ${confirmFeeling}`;

    message = `🎯 Вот твой целевой слайд:\n\n---\n${fullSlide}\n---\n\n✨ Это твоя точка назначения. Будем возвращаться к ней весь курс.`;
    inlineKeyboard = [
      [{text: '✅ Всё верно, сохраняем', callback_data: 'slide_save'}],
      [{text: '✏️ Хочу переписать', callback_data: 'slide_rewrite'}]
    ];
    nextStep = 10; // Ожидание подтверждения — предотвращает повторное попадание в save_slide_feeling
    break;

  case 'save_final_slide':
    const finalPlace = data.state?.slide_place || '';
    const finalPeople = data.state?.slide_people || '';
    const finalFeeling = data.state?.slide_feeling || '';
    // Сохраняем ровно тот же формат, что показали в превью
    saveFinalSlide = `${finalPlace}\n\nРядом: ${finalPeople}\n\nЧувствую: ${finalFeeling}`;
    startCourseAction = true;
    
    message = '✅ Слайд сохранён!\n\n🚀 Курс начинается.\n\n📅 ДЕНЬ 1 ИЗ 78\n\n🌅 Сегодня — про пробуждение.\n\nКогда-то ты видел мир как чудо. Потом тебя "усыпили" — научили воспринимать только физическое. Пора вспомнить.\n\n👁️ Сегодня замечай моменты, когда жизнь как сон — автоматические действия, привычные маршруты. Просто замечай.\n\n🔑 Это первый шаг к управлению.';
    inlineKeyboard = [
      [{text: '📖 Полное задание', callback_data: 'show_full_task'}],
      [{text: '❓ Задать вопрос', callback_data: 'ask_question'}]
    ];
    break;

  case 'rewrite_slide':
    message = '✏️ Хорошо, давай заново.\n\n🌟 Представь: прошло время, ты достиг того, чего хочешь больше всего.\n\n👀 Что ты ВИДИШЬ вокруг?\n📍 Где находишься? Какое это место?';
    nextStep = 2;
    break;

  case 'waiting_slide_confirm':
    message = '☝️ Нажми одну из кнопок выше — «✅ Всё верно» или «✏️ Хочу переписать».';
    break;

  case 'prompt_question':
    message = '❓ О чём хочешь спросить?\n\n💬 Напиши свой вопрос — я помогу разобраться в практике.';
    break;

  case 'ask_for_report':
    message = '📝 Расскажи, как прошла твоя практика сегодня?\n\nЧто заметил? Какие мысли или ощущения были?';
    setAwaitingReport = true;
    break;

  case 'save_report':
    // Данные для RPC — сообщение отправит 📤 Send Report Confirmation
    saveReportData = {
      telegram_id: data.trigger?.message?.chat?.id || data.telegram_chat_id,
      report_text: data.user_message
    };
    break;

  case 'show_full_task_msg':
    showFullTask = true;
    break;

  case 'welcome_back':
    const slide = data.state?.target_slide || 'не задан';
    const uName = data.user?.preferred_name || data.user?.first_name || 'друг';
    message = `👋 С возвращением, ${uName}!\n\n🎯 Твой целевой слайд:\n"${slide}"\n\n💬 Хочешь обновить слайд или просто поговорим?`;
    break;

  case 'show_slide':
    const currentSlide = data.state?.target_slide || null;
    const slideName = data.user?.preferred_name || data.user?.first_name || 'друг';
    if (currentSlide) {
      message = `🎯 Твой целевой слайд, ${slideName}:\n\n"${currentSlide}"\n\n✏️ Чтобы обновить слайд, просто напиши мне новый текст — я пойму и сохраню ✨`;
    } else {
      message = `${slideName}, у тебя пока нет целевого слайда 🤔\n\n💭 Напиши мне свой слайд — картинку желаемого будущего от первого лица.`;
    }
    break;

  default:
    message = '🤔 Что-то пошло не так. Напиши /start чтобы начать сначала.';
}

return {
  chat_id: data.telegram_chat_id,
  text: message,
  inline_keyboard: inlineKeyboard,
  user_id: data.user_id,
  next_step: nextStep,
  save_name: saveName,
  save_style: saveStyle,
  save_slide_place: saveSlidePlace,
  save_slide_people: saveSlidePeople,
  save_slide_feeling: saveSlideFeeling,
  save_final_slide: saveFinalSlide,
  start_course_action: startCourseAction,
  show_full_task: showFullTask,
  set_awaiting_report: setAwaitingReport,
  save_report_data: saveReportData,
  route: route,
  is_callback: data.is_callback,
  callback_id: data.trigger?.callback_query?.id
};
