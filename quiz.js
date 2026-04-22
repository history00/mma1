// quiz.js — ПОЛНАЯ ВЕРСИЯ

const quizDatabase = {}; // оставляем для совместимости, но будем загружать из Supabase

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

function formatTime(seconds) {
    if (seconds < 60) return `${seconds} сек`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} мин. ${remainingSeconds} сек`;
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundButton();
    localStorage.setItem('quizSoundEnabled', soundEnabled);
}

function updateSoundButton() {
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    if (soundToggle && soundIcon) {
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    }
}

function playCorrectSound() {
    if (!soundEnabled) return;
    const sound = document.getElementById('correct-sound');
    if (sound) sound.play().catch(() => {});
}

function playWrongSound() {
    if (!soundEnabled) return;
    const sound = document.getElementById('wrong-sound');
    if (sound) sound.play().catch(() => {});
}

async function loadQuizzes() {
    const grid = document.getElementById('quiz-grid');
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#aaa;">Загрузка викторин...</div>';

    try {
        const { data, error } = await sb.from('quizzes').select('*').eq('hidden', false).order('ord');
        if (error) throw error;

        grid.innerHTML = '';

        data.forEach(quiz => {
            const card = document.createElement('div');
            card.className = 'quiz-card';
            card.style.height = '380px'; // фиксированная высота
            card.innerHTML = `
                <div class="quiz-image">
                    <img src="${quiz.img || 'images/quiz_covers/default.jpg'}" class="quiz-cover-image" alt="${quiz.title}">
                </div>
                <div class="quiz-content">
                    <h3 class="quiz-title">${quiz.title}</h3>
                </div>
            `;
            card.onclick = () => startQuiz(quiz.id, quiz);
            grid.appendChild(card);
        });
    } catch (e) {
        console.error(e);
        grid.innerHTML = `<p style="color:#ff6b6b;grid-column:1/-1;text-align:center;">Ошибка загрузки. Проверьте Supabase.</p>`;
    }
}

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

function startTimer() {
    timer = setInterval(() => {
        totalTimeSpent = Math.floor((new Date() - startTime) / 1000);
        document.getElementById('timer').textContent = formatTime(totalTimeSpent);
    }, 1000);
}

function showQuestion() {
    if (!currentQuiz) return;

    const question = currentQuiz.questions[currentQuestion];
    
    // Очистка старых подсказок
    document.getElementById('timer-hint').innerHTML = '';

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

function updateClockHint(question) {
    const hintContainer = document.getElementById('timer-hint');
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
        score++;
        playCorrectSound();
    } else {
        answerButtons[selectedIndex].classList.add('incorrect');
        answerButtons[question.correct].classList.add('correct');
        document.getElementById('quiz-feedback').innerHTML = '❌ Неправильно!';
        document.getElementById('quiz-feedback').className = 'quiz-feedback incorrect';
        document.getElementById('answer-explanation').textContent = question.explanation || '';
        document.getElementById('answer-explanation').style.display = 'block';
        playWrongSound();
    }

    document.getElementById('next-btn').style.display = 'block';
}

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
        score++;
        playCorrectSound();
    } else {
        document.getElementById('quiz-feedback').innerHTML = '❌ Неправильно!';
        document.getElementById('quiz-feedback').className = 'quiz-feedback incorrect';
        document.getElementById('answer-explanation').textContent = question.explanation || '';
        document.getElementById('answer-explanation').style.display = 'block';
        playWrongSound();
    }

    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < currentQuiz.questions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    clearInterval(timer);
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('results-screen').classList.add('active');

    const total = currentQuiz.questions.length;
    document.getElementById('correct-answers').textContent = `${score}/${total}`;
    document.getElementById('time-spent').textContent = formatTime(totalTimeSpent);
    document.getElementById('total-score').textContent = score;
}

function restartQuiz() {
    window.location.reload();
}

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

    const { error } = await sb.from('results').insert(resultData);

    if (error) {
        console.error(error);
        alert('Ошибка сохранения результата');
    } else {
        alert('✅ Результат сохранён в таблицу лидеров!');
        window.location.href = `leaders.html?quiz=${currentQuizId}`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await loadQuizzes();
    
    const savedSound = localStorage.getItem('quizSoundEnabled');
    soundEnabled = savedSound !== null ? JSON.parse(savedSound) : true;
    updateSoundButton();
});
