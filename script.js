// Глобальные переменные
let gameMode = 'letters'; // 'letters' или 'pairs'
let hideImages = false;
let timerInterval;
let timerDuration = 60 * 30; // Время в секундах
let timeLeft = timerDuration;
let isTimerRunning = false;
let statistics = {
    correct: 0,
    wrong: 0,
    details: {} // Детальная статистика по буквам/слогам
};

let linksImage = {
    "а": "0 0",
    "б": "-120px 0",
    "в": "-240px 0",
    "г": "-340px 0",
    "д": "-460px 0",
    "е": "-580px 0",
    "ё": "-700px 0",
    "ж": "-795px 0",
    "з": "-5px -130px",
    "и": "-115px -130px",
    "й": "-225px -380px",
    "к": "-235px -130px",
    "л": "555px -130px",
    "м": "-455px -130px",
    "н": "335px -130px",
    "о": "225px -130px",
    "п": "105px -130px",
    "р": "-5px -250px",
    "с": "-115px -250px",
    "т": "-225px -250px",
    "у": "-335px -250px",
    "ф": "-455px -250px",
    "х": "-325px -380px",
    "ц": "-425px -380px",
    "ч": "-555px -250px",
    "ш": "-665px -250px",
    "щ": "-525px -380px",
    "ъ": "-705px -383px",
    "ы": "-785px -383px",
    "ь": "-620px -383px",
    "э": "-785px -263px",
    "ю": "-5px -375px",
    "я": "-115px -375px"
};

// Наборы букв и слогов
const letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
const pairs = [
    "ба", "ва", "га", "да", "жа", "за", "ка", "ла", "ма", "на",
    "па", "ра", "са", "та", "фа", "ха", "ца", "ча", "ша", "ща",

    "бо", "во", "го", "до", "жо", "зо", "ко", "ло", "мо", "но",
    "по", "ро", "со", "то", "фо", "хо", "цо", "чо", "шо", "що",

    "бе", "ве", "ге", "де", "же", "зе", "ке", "ле", "ме", "не",
    "пе", "ре", "се", "те", "фе", "хе", "це", "че", "ше", "ще",

    "би", "ви", "ги", "ди", "жи", "зи", "ки", "ли", "ми", "ни",
    "пи", "ри", "си", "ти", "фи", "хи", "ци", "чи", "ши", "щи",

    "бу", "ву", "гу", "ду", "жу", "зу", "ку", "лу", "му", "ну",
    "пу", "ру", "су", "ту", "фу", "ху", "цу", "чу", "шу", "щу",

    "бы", "вы", "гы", "ды", "жы", "зы", "кы", "лы", "мы", "ны",
    "пы", "ры", "сы", "ты", "фы", "хы", "цы", "чы", "шы", "щы",

    "бэ", "вэ", "гэ", "дэ", "жэ", "зэ", "кэ", "лэ", "мэ", "нэ",
    "пэ", "рэ", "сэ", "тэ", "фэ", "хэ", "цэ", "чэ", "шэ", "щэ",

    "бю", "вю", "гю", "дю", "жю", "зю", "кю", "лю", "мю", "ню",
    "пю", "рю", "сю", "тю", "фю", "хю", "цю", "чю", "шю", "щю",

    "бя", "вя", "гя", "дя", "жя", "зя", "кя", "ля", "мя", "ня",
    "пя", "ря", "ся", "тя", "фя", "хя", "ця", "чя", "шя", "щя",

    // Новые слоги с "ь"
    "бь", "вь", "гь", "дь", "жь", "зь", "кь", "ль", "мь", "нь",
    "пь", "рь", "сь", "ть", "фь", "хь", "ць", "чь", "шь", "щь",

    // Новые слоги с "ъ"
    "бъ", "въ", "гъ", "дъ", "жъ", "зъ", "къ", "лъ", "мъ", "нъ",
    "пъ", "ръ", "съ", "тъ", "фъ", "хъ", "цъ", "чъ", "шъ", "щъ"
];

// Текущая цель (буква или слог)
let currentTarget = letters[0];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Настройка переключателей режима игры
    document.getElementById('letters-mode').addEventListener('click', () => switchMode('letters'));
    document.getElementById('pairs-mode').addEventListener('click', () => switchMode('pairs'));
    
    // Переключатель скрытия изображений
    document.getElementById('hide-images-toggle').addEventListener('change', toggleHideImages);
    
    // Кнопки таймера
    document.getElementById('start-timer').addEventListener('click', startTimer);
    document.getElementById('pause-timer').addEventListener('click', pauseTimer);
    document.getElementById('reset-timer').addEventListener('click', resetTimer);
    
    // Кнопки ответов
    document.getElementById('correct-answer').addEventListener('click', recordCorrectAnswer);
    document.getElementById('wrong-answer').addEventListener('click', recordWrongAnswer);
    document.getElementById('reset-game').addEventListener('click', resetGame);
    
    // Инициализация игры
    initializeGame();
});

// Инициализация игры
function initializeGame() {
    resetStatistics();
    updateStatisticsDisplay();
    setNewTarget();
    createImagePanels();
    showTime();
}

// Переключение режима игры
function switchMode(mode) {
    gameMode = mode;
    
    // Обновление визуального состояния кнопок
    document.getElementById('letters-mode').classList.toggle('active', mode === 'letters');
    document.getElementById('pairs-mode').classList.toggle('active', mode === 'pairs');
    
    // Сброс игры при смене режима
    resetGame();
}

// Переключение скрытия изображений
function toggleHideImages() {
    hideImages = document.getElementById('hide-images-toggle').checked;
    
    // Обновление отображения изображений
    const panels = document.querySelectorAll('.image-panel');
    panels.forEach(panel => {
        panel.classList.toggle('hidden', hideImages);
    });
}

// Создание панелей с изображениями
function createImagePanels() {
    const container = document.getElementById('image-container');
    const currentLetter = document.getElementById('current-letter');
  
  
    container.innerHTML = '';
    
    // Создаем 6 панелей для изображений
    for (let i = 0; i < currentLetter.textContent.length; i++) {
        const currentWord = currentLetter.textContent[i].toLowerCase();
      
        const panel = document.createElement('div');
        panel.className = 'image-panel';
        panel.classList.toggle('hidden', hideImages);
        
        const img = document.createElement('div');
        img.className = 'image-word';
        // Здесь для примера используем плейсхолдер, в реальном приложении будут настоящие изображения
        img.style.background = `https://pay.enchantedworld.io/alpa.png`;
        img.style.backgroundPosition = linksImage[currentWord];

        
        panel.appendChild(img);
        container.appendChild(panel);
        
        // Добавление обработчика клика по изображению
        panel.addEventListener('click', () => handleImageClick(panel, i));
    }
}

// Обработка клика по изображению
function handleImageClick(panel, index) {
    // В реальном приложении здесь будет логика проверки соответствия изображения текущей букве/слогу
    // Для примера просто случайно определяем результат
    const isCorrect = Math.random() > 0.5;
    
    panel.classList.add(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
        recordCorrectAnswer();
    } else {
        recordWrongAnswer();
    }
    
    // Убираем класс через некоторое время
    setTimeout(() => {
        panel.classList.remove('correct', 'wrong');
        setNewTarget(); // Устанавливаем новую цель
    }, 1000);
}

// Установка новой цели (буквы или слога)
function setNewTarget() {
    const targets = gameMode === 'letters' ? letters : pairs;
    const randomIndex = Math.floor(Math.random() * targets.length);
    currentTarget = targets[randomIndex];
    
    document.getElementById('current-letter').textContent = currentTarget;
}

// Запись правильного ответа
function recordCorrectAnswer() {
    statistics.correct++;
    
    if (!statistics.details[currentTarget]) {
        statistics.details[currentTarget] = { correct: 0, wrong: 0 };
    }
    statistics.details[currentTarget].correct++;
    
    updateStatisticsDisplay();
    setNewTarget();
    createImagePanels();
}

// Запись неправильного ответа
function recordWrongAnswer() {
    statistics.wrong++;
    
    if (!statistics.details[currentTarget]) {
        statistics.details[currentTarget] = { correct: 0, wrong: 0 };
    }
    statistics.details[currentTarget].wrong++;
    
    updateStatisticsDisplay();
    setNewTarget();
    createImagePanels();
}

// Обновление отображения статистики
function updateStatisticsDisplay() {
    document.getElementById('correct-count').textContent = statistics.correct;
    document.getElementById('wrong-count').textContent = statistics.wrong;
    document.getElementById('total-correct').textContent = statistics.correct;
    
    // Обновление детальной статистики
    const detailedStats = document.getElementById('detailed-stats');
    detailedStats.innerHTML = '';
    
    for (const [target, stats] of Object.entries(statistics.details)) {
        const statItem = document.createElement('div');
        statItem.className = 'letter-stat';
        statItem.innerHTML = `
            <span>${target}</span>
            <span>Правильно: ${stats.correct}, Неправильно: ${stats.wrong}</span>
        `;
        detailedStats.appendChild(statItem);
    }
}

// Сброс статистики
function resetStatistics() {
    statistics = {
        correct: 0,
        wrong: 0,
        details: {}
    };
}

// Запуск таймера
function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
    }
}

// Пауза таймера
function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
}

// Обновление таймера
function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        const progressPercentage = (timeLeft / timerDuration) * 100;
        document.getElementById('timer-progress').style.width = `${progressPercentage}%`;
      
        showTime();
      
        // Изменение цвета таймера при приближении к концу
        if (progressPercentage < 20) {
            document.getElementById('timer-progress').style.backgroundColor = '#e74c3c';
        } else if (progressPercentage < 50) {
            document.getElementById('timer-progress').style.backgroundColor = '#f39c12';
        } else {
            document.getElementById('timer-progress').style.backgroundColor = '#2ecc71';
        }
    } else {
        // Время вышло
        pauseTimer();
        alert('Время вышло! Игра завершена.');
    }
}

function showTime() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer-display').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
}

// Сброс таймера
function resetTimer() {
    pauseTimer();
    timeLeft = timerDuration;
    document.getElementById('timer-progress').style.width = '100%';
    document.getElementById('timer-progress').style.backgroundColor = '#2ecc71';
    showTime();
 
}

// Сброс игры
function resetGame() {
    resetTimer();
    resetStatistics();
    updateStatisticsDisplay();
    setNewTarget();
    createImagePanels();
}
