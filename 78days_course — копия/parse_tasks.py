#!/usr/bin/env python3
"""
Парсер транскриптов курса "78 дней с Трансерфингом"
Извлекает 78 заданий из part1-4.txt и генерирует SQL INSERT
"""

import re
import json

# Словарь для конвертации слов в числа
WORD_TO_NUM = {
    'первый': 1, 'второй': 2, 'третий': 3, 'четвёртый': 4, 'четвертый': 4,
    'пятый': 5, 'шестой': 6, 'седьмой': 7, 'восьмой': 8, 'девятый': 9,
    'десятый': 10, 'одиннадцатый': 11, 'двенадцатый': 12, 'тринадцатый': 13,
    'четырнадцатый': 14, 'пятнадцатый': 15, 'шестнадцатый': 16, 'семнадцатый': 17,
    'восемнадцатый': 18, 'девятнадцатый': 19,
    'двадцатый': 20,
    'двадцать первый': 21, 'двадцать второй': 22, 'двадцать третий': 23,
    'двадцать четвёртый': 24, 'двадцать четвертый': 24,
    'двадцать пятый': 25, 'двадцать шестой': 26, 'двадцать седьмой': 27,
    'двадцать восьмой': 28, 'двадцать девятый': 29,
    'тридцатый': 30,
    'тридцать первый': 31, 'тридцать второй': 32, 'тридцать третий': 33,
    'тридцать четвёртый': 34, 'тридцать четвертый': 34,
    'тридцать пятый': 35, 'тридцать шестой': 36, 'тридцать седьмой': 37,
    'тридцать восьмой': 38, 'тридцать девятый': 39,
    'сороковой': 40,
    'сорок первый': 41, 'сорок второй': 42, 'сорок третий': 43,
    'сорок четвёртый': 44, 'сорок четвертый': 44,
    'сорок пятый': 45, 'сорок шестой': 46, 'сорок седьмой': 47,
    'сорок восьмой': 48, 'сорок девятый': 49,
    'пятидесятый': 50,
    'пятьдесят первый': 51, 'пятьдесят второй': 52, 'пятьдесят третий': 53,
    'пятьдесят четвёртый': 54, 'пятьдесят четвертый': 54,
    'пятьдесят пятый': 55, 'пятьдесят шестой': 56, 'пятьдесят седьмой': 57,
    'пятьдесят восьмой': 58, 'пятьдесят девятый': 59,
    'шестидесятый': 60,
    'шестьдесят первый': 61, 'шестьдесят второй': 62, 'шестьдесят третий': 63,
    'шестьдесят четвёртый': 64, 'шестьдесят четвертый': 64,
    'шестьдесят пятый': 65, 'шестьдесят шестой': 66, 'шестьдесят седьмой': 67,
    'шестьдесят восьмой': 68, 'шестьдесят девятый': 69,
    'семидесятый': 70,
    'семьдесят первый': 71, 'семьдесят второй': 72, 'семьдесят третий': 73,
    'семьдесят четвёртый': 74, 'семьдесят четвертый': 74,
    'семьдесят пятый': 75, 'семьдесят шестой': 76, 'семьдесят седьмой': 77,
    'семьдесят восьмой': 78,
}

def parse_day_number(text):
    """Извлекает номер дня из текста"""
    text_lower = text.lower().strip()

    # Сначала пробуем числовой формат: "День 10", "День 54"
    num_match = re.search(r'день\s+(\d+)', text_lower)
    if num_match:
        return int(num_match.group(1))

    # Затем словесный формат (сортируем по длине - сначала длинные)
    for word, num in sorted(WORD_TO_NUM.items(), key=lambda x: -len(x[0])):
        if word in text_lower:
            return num

    # Проверяем обрезанные формы (из транскрипции)
    truncated_patterns = {
        'восемнадцат': 18,
        'тридцать пят': 35,
        'тридцать девят': 39,
        'сорок перв': 41,
        'сорок втор': 42,
        'сорок пят': 45,
        'сорок восьм': 48,
        'шестидесят': 60,  # без окончания
        'шестьдесят перв': 61,
        'шестьдесят пят': 65,
    }
    for pattern, num in truncated_patterns.items():
        if pattern in text_lower:
            return num

    return None

def extract_tasks(text, start_day=1):
    """Извлекает задания из текста"""
    tasks = []

    # Паттерн для разделения по дням
    # Ищем: "День N" или "День первый" или обрезанные формы
    day_pattern = r'День\s+(?:\d+|[а-яё]+(?:\s+[а-яё]+)?)'

    # Разбиваем текст по дням
    parts = re.split(f'({day_pattern})', text, flags=re.IGNORECASE)

    current_day = None
    current_content = ""

    for i, part in enumerate(parts):
        if re.match(day_pattern, part, re.IGNORECASE):
            # Это заголовок дня
            if current_day and current_content:
                tasks.append((current_day, current_content.strip()))

            current_day = parse_day_number(part)
            current_content = ""
        else:
            current_content += part

    # Добавляем последний день
    if current_day and current_content:
        tasks.append((current_day, current_content.strip()))

    return tasks

def parse_task_content(content):
    """Разбирает содержимое задания на название, декларацию и толкование"""
    # Извлекаем название (до "Декларация")
    title_match = re.match(r'^\.?\s*([^.]+?)\.?\s*Декларация', content, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1).strip() if title_match else ""

    # Чистим название от мусора
    title = re.sub(r'^[.\s]+', '', title)
    title = title.strip()

    # Извлекаем декларацию (между "Декларация" и "Толкование")
    decl_match = re.search(r'Декларация\.?\s*(.*?)\s*Толкование', content, re.IGNORECASE | re.DOTALL)
    declaration = decl_match.group(1).strip() if decl_match else ""

    # Извлекаем толкование (после "Толкование")
    tolk_match = re.search(r'Толкование\.?\s*(.*?)$', content, re.IGNORECASE | re.DOTALL)
    interpretation = tolk_match.group(1).strip() if tolk_match else ""

    # Очищаем от лишних пробелов
    declaration = re.sub(r'\s+', ' ', declaration).strip()
    interpretation = re.sub(r'\s+', ' ', interpretation).strip()

    return title, declaration, interpretation

def main():
    # Читаем все файлы
    all_text = ""
    for i in range(1, 5):
        filepath = f"part{i}.txt"
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                all_text += f.read() + "\n\n"
        except FileNotFoundError:
            print(f"Файл {filepath} не найден")

    # Парсим задания
    raw_tasks = extract_tasks(all_text)

    # Сортируем по номеру дня
    raw_tasks.sort(key=lambda x: x[0] if x[0] else 999)

    # Обрабатываем каждое задание
    tasks = []
    for day_num, content in raw_tasks:
        if day_num is None or day_num < 1 or day_num > 78:
            continue

        title, declaration, interpretation = parse_task_content(content)

        # Формируем полный контент задания
        full_content = f"**Декларация**\n\n{declaration}\n\n**Толкование**\n\n{interpretation}"

        # Формируем заголовок
        if title:
            full_title = f"День {day_num}: {title}"
        else:
            full_title = f"День {day_num}"

        tasks.append({
            'day_number': day_num,
            'title': full_title,
            'content': full_content
        })

    # Удаляем дубликаты (оставляем первый)
    seen_days = set()
    unique_tasks = []
    for task in tasks:
        if task['day_number'] not in seen_days:
            seen_days.add(task['day_number'])
            unique_tasks.append(task)

    # Сортируем финально
    unique_tasks.sort(key=lambda x: x['day_number'])

    print(f"Найдено уникальных дней: {len(unique_tasks)}")
    print(f"Номера дней: {[t['day_number'] for t in unique_tasks]}")

    # Сохраняем JSON
    with open('course_tasks.json', 'w', encoding='utf-8') as f:
        json.dump(unique_tasks, f, ensure_ascii=False, indent=2)
    print("\nСохранено в course_tasks.json")

    # Генерируем SQL
    sql_lines = ["-- INSERT 78 заданий курса\n"]
    sql_lines.append("INSERT INTO course_tasks (program_slug, day_number, title, content) VALUES\n")

    values = []
    for task in unique_tasks:
        title_escaped = task['title'].replace("'", "''")
        content_escaped = task['content'].replace("'", "''")
        values.append(f"  ('78days', {task['day_number']}, '{title_escaped}', '{content_escaped}')")

    sql_lines.append(",\n".join(values))
    sql_lines.append(";\n")

    with open('course_tasks.sql', 'w', encoding='utf-8') as f:
        f.writelines(sql_lines)
    print("Сохранено в course_tasks.sql")

    # Показываем первые 3 задания для проверки
    print("\n=== Первые 3 задания для проверки ===")
    for task in unique_tasks[:3]:
        print(f"\n--- {task['title']} ---")
        print(task['content'][:500] + "...")

if __name__ == "__main__":
    main()
