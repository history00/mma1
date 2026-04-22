// quiz.js — ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

let sb;
let currentQuiz = null;
let currentQuizId = null;
let currentQuestion = 0;
let score = 0;
let timer = null;
let startTime = null;
let totalTimeSpent = 0;
let userAnswers = [];
let soundEnabled = true;
let selectedAnswers = [];
let isMultipleSelection = false;
let maxSelections = 0;
let isFullscreen = false;

// ====================== ФОРМАТИРОВАНИЕ ======================

function formatTime(seconds) {
    if (seconds < 60) return `${seconds} сек`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} мин. ${remainingSeconds} сек`;
}

// ====================== ЗВУК ======================

function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundButton();
    localStorage.setItem('quizSoundEnabled', soundEnabled);
}

function updateSoundButton() {
    const btn = document.getElementById('sound-toggle');
    if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
}

function playCorrectSound() {
    if (!soundEnabled) return;
    const sound = document.getElementById('correct-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

function playWrongSound() {
    if (!soundEnabled) return;
    const sound = document.getElementById('wrong-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

// ====================== ЗАГРУЗКА ВИКТОРИН ======================

async function loadQuizzes() {
    const grid = document.getElementById('quiz-grid');
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#aaa;">Загрузка викторин...</div>';

    try {
        const { data, error } = await sb
            .from('quizzes')
            .select('*')
            .eq('hidden', false)
            .order('ord', { ascending: true });

        if (error) throw error;

        grid.innerHTML = '';

        if (data.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#aaa;">Викторины скоро появятся...</div>';
            return;
        }

        data.forEach(quiz => {
            const card = document.createElement('div');
            card.className = 'quiz-card';
            card.style.height = '380px';
            card.innerHTML = `
                <div class="quiz-image">
                    <img src="${quiz.img || 'images/default.jpg'}" alt="${quiz.title}" class="quiz-cover-image">
                </div>
                <div class="quiz-content">
                    <h3 class="quiz-title">${quiz.title}</h3>
                </div>
            `;
            card.onclick = () => startQuiz(quiz.id, quiz);
            grid.appendChild(card);
        });

    } catch (e) {
        console.error('Ошибка загрузки викторин:', e);
        grid.innerHTML = '<div style="grid-column:1/-1; color:#ff6b6b; text-align:center;">Ошибка загрузки. Проверьте Supabase.</div>';
    }
}

// ====================== СТАРТ ВИКТОРИНЫ ======================

async function startQuiz(quizId, quizData) {
    currentQuizId = quizId;
    currentQuiz = quizData;
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    selectedAnswers = [];
    startTime = new Date();

    document.getElementById('quiz-selection').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('active');

    const savedSound = localStorage.getItem('quizSoundEnabled');
    soundEnabled = savedSound !== null ? JSON.parse(savedSound) : true;
    updateSoundButton();

    startTimer();
    showQuestion();
}

// ====================== ТАЙМЕР ======================

function startTimer() {
    timer = setInterval(() => {
        totalTimeSpent = Math.floor((new Date() - startTime) / 1000);
        document.getElementById('timer').textContent = formatTime(totalTimeSpent);
    }, 1000);
}

// ====================== ПОКАЗ ВОПРОСА ======================

function showQuestion() {
    if (!currentQuiz) return;

    const question = currentQuiz.questions[currentQuestion];

    // Прогресс
    const progress = ((currentQuestion) / currentQuiz.questions.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('progress-text').textContent = `Вопрос ${currentQuestion + 1}/${currentQuiz.questions.length}`;

    // Вопрос
    document.getElementById('question-text').textContent = question.question;

    // Изображение
    const qImage = document.getElementById('question-image');
    qImage.innerHTML = '';
    if (question.image) {
        qImage.style.display = 'flex';
        const img = document.createElement('img');
        img.src = question.image;
        img.className = 'question-image-content';
        qImage.appendChild(img);
    } else {
        qImage.style.display = 'none';
    }

    // Ответы
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';

    selectedAnswers = [];
    isMultipleSelection = question.multiple || false;
    maxSelections = isMultipleSelection ? question.correct.length : 1;

    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.innerHTML = `
            <span class="answer-text">${answer}</span>
            <span class="answer-hover-effect"></span>
            ${isMultipleSelection ? '<span class="answer-checkmark"></span>' : ''}
        `;
        button.onclick = () => selectAnswer(index);
        answersContainer.appendChild(button);
    });

    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('quiz-feedback').style.display = 'none';
    document.getElementById('answer-explanation').style.display = 'none';

    // Подсказка часами
    updateClockHint(question);
}

// ====================== ПОДСКАЗКА ЧАСАМИ ======================

function updateClockHint(question) {
    const hintContainer = document.getElementById('timer-hint');
    hintContainer.innerHTML = '';

    let clockIndex = 0;

    if (Array.isArray(question.correct)) {
        clockIndex = (question.correct[0] - 1 + 4) % 4;
    } else {
        clockIndex = (question.correct - 1 + 4) % 4;
    }

    const clockImages = ['clock_9.png', 'clock_12.png', 'clock_3.png', 'clock_6.png'];
    const img = document.createElement('img');
    img.src = `images/clock/${clockImages[clockIndex]}`;
    img.className = 'clock-hint';
    img.title = 'Подсказка: часы показывают правильный ответ';
    hintContainer.appendChild(img);
}

// ====================== ВЫБОР ОТВЕТА ======================

function selectAnswer(selectedIndex) {
    const question = currentQuiz.questions[currentQuestion];
    const answerButtons = document.querySelectorAll('.answer-btn');

    if (isMultipleSelection) {
        const index = selectedAnswers.indexOf(selectedIndex);
        if (index > -1) {
            selectedAnswers.splice(index, 1);
            answerButtons[selectedIndex].classList.remove('selected');
        } else if (selectedAnswers.length < maxSelections) {
            selectedAnswers.push(selectedIndex);
            answerButtons[selectedIndex].classList.add('selected');
        }

        if (selectedAnswers.length === maxSelections) {
            checkMultipleAnswer();
        }
    } else {
        checkSingleAnswer(selectedIndex);
    }
}

// ====================== ПРОВЕРКА ОДИНОЧНОГО ОТВЕТА ======================

function checkSingleAnswer(selectedIndex) {
    const question = currentQuiz.questions[currentQuestion];
    const answerButtons = document.querySelectorAll('.answer-btn');

    userAnswers.push({
        question: question.question,
        userAnswer: question.answers[selectedIndex],
        correctAnswer: question.answers[question.correct],
        isCorrect: selectedIndex === question.correct
    });

    answerButtons.forEach(btn => btn.classList.add('disabled'));

    if (selectedIndex === question.correct) {
        answerButtons[selectedIndex].classList.add('correct');
        document.getElementById('quiz-feedback').innerHTML = '✅ Правильно! +1 балл';
        document.getElementById('quiz-feedback').className = 'quiz-feedback correct';
        document.getElementById('quiz-feedback').style.display = 'block';
        score++;
        playCorrectSound();
    } else {
        answerButtons[selectedIndex].classList.add('incorrect');
        answerButtons[question.correct].classList.add('correct');
        document.getElementById('quiz-feedback').innerHTML = '❌ Неправильно!';
        document.getElementById('quiz-feedback').className = 'quiz-feedback incorrect';
        document.getElementById('quiz-feedback').style.display = 'block';
        document.getElementById('answer-explanation').textContent = question.explanation || '';
        document.getElementById('answer-explanation').style.display = 'block';
        playWrongSound();
    }

    document.getElementById('next-btn').style.display = 'block';
}

// ====================== ПРОВЕРКА МНОЖЕСТВЕННОГО ОТВЕТА ======================

function checkMultipleAnswer() {
    const question = currentQuiz.questions[currentQuestion];
    const answerButtons = document.querySelectorAll('.answer-btn');

    const sortedSelected = [...selectedAnswers].sort();
    const sortedCorrect = [...question.correct].sort();
    const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);

    userAnswers.push({
        question: question.question,
        userAnswer: selectedAnswers.map(i => question.answers[i]).join(', '),
        correctAnswer: question.correct.map(i => question.answers[i]).join(', '),
        isCorrect: isCorrect
    });

    answerButtons.forEach(btn => btn.classList.add('disabled'));

    answerButtons.forEach((btn, index) => {
        if (question.correct.includes(index)) btn.classList.add('correct');
        else if (selectedAnswers.includes(index)) btn.classList.add('incorrect');
    });

    if (isCorrect) {
        document.getElementById('quiz-feedback').innerHTML = '✅ Правильно! +1 балл';
        document.getElementById('quiz-feedback').className = 'quiz-feedback correct';
        document.getElementById('quiz-feedback').style.display = 'block';
        score++;
        playCorrectSound();
    } else {
        document.getElementById('quiz-feedback').innerHTML = '❌ Неправильно!';
        document.getElementById('quiz-feedback').className = 'quiz-feedback incorrect';
        document.getElementById('quiz-feedback').style.display = 'block';
        document.getElementById('answer-explanation').textContent = question.explanation || '';
        document.getElementById('answer-explanation').style.display = 'block';
        playWrongSound();
    }

    document.getElementById('next-btn').style.display = 'block';
}

// ====================== СЛЕДУЮЩИЙ ВОПРОС ======================

function nextQuestion() {
    currentQuestion++;

    if (currentQuestion < currentQuiz.questions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

// ====================== ЗАВЕРШЕНИЕ ======================

function finishQuiz() {
    clearInterval(timer);

    if (isFullscreen) {
        exitFullscreen();
    }

    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('results-screen').classList.add('active');

    const total = currentQuiz.questions.length;
    document.getElementById('correct-answers').textContent = `${score}/${total}`;
    document.getElementById('time-spent').textContent = formatTime(totalTimeSpent);
    document.getElementById('total-score').textContent = score;
}

// ====================== ПЕРЕЗАПУСК ======================

function restartQuiz() {
    window.location.reload();
}

// ====================== СОХРАНЕНИЕ РЕЗУЛЬТАТА ======================

async function saveResults() {
    const playerName = document.getElementById('player-nickname').value.trim();
    if (!playerName) {
        alert('Введите никнейм!');
        return;
    }

    const resultData = {
        player_name: playerName,
        score: score,
        total: currentQuiz.questions.length,
        time_sec: totalTimeSpent,
        pct: Math.round((score / currentQuiz.questions.length) * 100),
        quiz_id: currentQuizId,
        quiz_title: currentQuiz.title
    };

    try {
        const { error } = await sb.from('results').insert(resultData);

        if (error) throw error;

        alert('✅ Результат сохранён в таблицу лидеров!');
        window.location.href = `leaders.html?quiz=${currentQuizId}`;
    } catch (e) {
        console.error('Ошибка сохранения:', e);
        alert('Ошибка сохранения результата');
    }
}

// ====================== ПОЛНОЭКРАН ======================

function toggleFullscreen() {
    const elem = document.querySelector('.quiz-screen');
    if (!isFullscreen) {
        if (elem.requestFullscreen) elem.requestFullscreen();
        isFullscreen = true;
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        isFullscreen = false;
    }
}

// ====================== МОДАЛЬНЫЕ ОКНА ======================

function showClassSelector() {
    document.getElementById('class-selector-modal').style.display = 'block';
}

function closeClassSelector() {
    document.getElementById('class-selector-modal').style.display = 'none';
}

function selectClass(className) {
    document.getElementById('selected-class').textContent = className;
    closeClassSelector();
    showWheelModal();
}

function showWheelModal() {
    document.getElementById('wheel-modal').style.display = 'block';
    setTimeout(() => {
        if (typeof initWheel === 'function') {
            initWheel(document.getElementById('selected-class').textContent);
        }
    }, 300);
}

function closeWheelModal() {
    document.getElementById('wheel-modal').style.display = 'none';
}

window.onclick = function(event) {
    const classModal = document.getElementById('class-selector-modal');
    const wheelModal = document.getElementById('wheel-modal');
    
    if (event.target === classModal) closeClassSelector();
    if (event.target === wheelModal) closeWheelModal();
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================

document.addEventListener('DOMContentLoaded', async () => {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const savedSound = localStorage.getItem('quizSoundEnabled');
    soundEnabled = savedSound !== null ? JSON.parse(savedSound) : true;
    updateSoundButton();

    await loadQuizzes();
});
