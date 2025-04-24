import os
import subprocess
import json
from pydub import AudioSegment
from concurrent.futures import ThreadPoolExecutor
import argparse

def get_audio_bitrate(file_path):
    """Определяет битрейт аудиофайла с помощью ffprobe"""
    try:
        cmd = [
            'ffprobe', 
            '-v', 'error', 
            '-select_streams', 'a:0', 
            '-show_entries', 'stream=bit_rate', 
            '-of', 'json', 
            file_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        data = json.loads(result.stdout)
        
        # Получаем битрейт из данных ffprobe
        bitrate = data.get('streams', [{}])[0].get('bit_rate')
        if bitrate:
            # Преобразуем в кбит/с и добавляем 10% для запаса качества
            return f"{min(320, int(int(bitrate) / 1000 * 1.1))}k"
    except Exception as e:
        print(f"Не удалось определить битрейт: {e}")
    
    # Возвращаем умеренный битрейт по умолчанию
    return "192k"

def convert_m4a_to_mp3(m4a_file, output_dir=None, bitrate=None, auto_bitrate=False):
    """
    Конвертирует файл M4A в MP3 с указанным битрейтом.
    
    Args:
        m4a_file (str): Путь к файлу M4A
        output_dir (str, optional): Директория для сохранения. По умолчанию та же, что и источник.
        bitrate (str, optional): Битрейт для выходного MP3 файла. По умолчанию "320k".
        auto_bitrate (bool): Автоматически определять оптимальный битрейт
    
    Returns:
        str: Путь к сконвертированному MP3 файлу
    """
    try:
        # Получаем имя файла и директорию
        file_path, file_name = os.path.split(m4a_file)
        file_base = os.path.splitext(file_name)[0]
        
        # Определяем выходной каталог
        if output_dir is None:
            output_dir = file_path
            
        # Создаем выходной каталог, если он не существует
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        # Выходной файл
        mp3_file = os.path.join(output_dir, f"{file_base}.mp3")
        
        # Определяем оптимальный битрейт, если требуется
        if auto_bitrate:
            used_bitrate = get_audio_bitrate(m4a_file)
            print(f"Автоматически определённый битрейт: {used_bitrate}")
        else:
            used_bitrate = bitrate
        
        # Загружаем аудио
        print(f"Конвертация: {m4a_file}")
        audio = AudioSegment.from_file(m4a_file, format="m4a")
        
        # Экспортируем в MP3
        audio.export(mp3_file, format="mp3", bitrate=used_bitrate)
        
        # Вывод информации о размерах файлов
        m4a_size = os.path.getsize(m4a_file) / (1024 * 1024)
        mp3_size = os.path.getsize(mp3_file) / (1024 * 1024)
        print(f"Готово: {mp3_file} [{mp3_size:.2f} MB, исходный: {m4a_size:.2f} MB]")
        
        return mp3_file
    except Exception as e:
        print(f"Ошибка при конвертации {m4a_file}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description='Конвертер M4A в MP3 с сохранением качества')
    parser.add_argument('--input', '-i', type=str, default='.', 
                        help='Директория с M4A файлами (по умолчанию: текущая)')
    parser.add_argument('--output', '-o', type=str, default=None, 
                        help='Директория для сохранения MP3 (по умолчанию: та же, что и источник)')
    parser.add_argument('--bitrate', '-b', type=str, default="320k", 
                        help='Битрейт MP3 (по умолчанию: 320k)')
    parser.add_argument('--auto-bitrate', '-a', action='store_true',
                        help='Автоматически определять оптимальный битрейт на основе исходного файла')
    parser.add_argument('--recursive', '-r', action='store_true', 
                        help='Искать файлы рекурсивно во вложенных директориях')
    parser.add_argument('--threads', '-t', type=int, default=4, 
                        help='Количество потоков для параллельной конвертации (по умолчанию: 4)')
    
    args = parser.parse_args()
    
    # Находим все M4A файлы
    m4a_files = []
    if args.recursive:
        for root, _, files in os.walk(args.input):
            for file in files:
                if file.lower().endswith('.m4a'):
                    m4a_files.append(os.path.join(root, file))
    else:
        m4a_files = [os.path.join(args.input, f) for f in os.listdir(args.input) 
                     if f.lower().endswith('.m4a') and os.path.isfile(os.path.join(args.input, f))]
    
    if not m4a_files:
        print(f"В указанной директории не найдено файлов M4A.")
        return
    
    print(f"Найдено {len(m4a_files)} M4A файлов для конвертации.")
    
    # Конвертируем все файлы в параллельных потоках
    with ThreadPoolExecutor(max_workers=args.threads) as executor:
        results = [executor.submit(convert_m4a_to_mp3, file, args.output, args.bitrate, args.auto_bitrate) 
                  for file in m4a_files]
    
    # Считаем статистику
    successful = sum(1 for r in results if r.result() is not None)
    print(f"\nКонвертация завершена: {successful} из {len(m4a_files)} файлов успешно сконвертировано.")

if __name__ == "__main__":
    main()