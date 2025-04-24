#!/bin/bash

# Проверка наличия аргумента с путем к папке
if [ $# -ne 1 ]; then
    echo "Использование: $0 /путь/к/папке"
    exit 1
fi

TARGET_DIR="$1"

# Проверка существования папки
if [ ! -d "$TARGET_DIR" ]; then
    echo "Ошибка: папка '$TARGET_DIR' не существует"
    exit 1
fi

# Поиск и подсчет MP3-файлов
MP3_FILES=$(find "$TARGET_DIR" -type f -name "*.mp3")
COUNT=$(echo "$MP3_FILES" | grep -c "\.mp3$")

if [ $COUNT -eq 0 ]; then
    echo "MP3-файлы не найдены в '$TARGET_DIR'"
    exit 0
fi

# Вывод списка файлов и запрос подтверждения
echo "Найдено $COUNT MP3-файлов в '$TARGET_DIR':"
echo "$MP3_FILES"
echo ""
echo -n "Удалить все эти файлы? (y/n): "
read CONFIRM

if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    # Удаление файлов
    find "$TARGET_DIR" -type f -name "*.mp3" -delete
    echo "Удалено $COUNT MP3-файлов"
else
    echo "Операция отменена"
fi