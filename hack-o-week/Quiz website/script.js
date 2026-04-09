// Database of questions
const quizData = {
    tech: [
        {
            question: "What does HTML stand for?",
            options: ["Hyper Text Preprocessor", "Hyper Text Markup Language", "Hyper Text Multiple Language", "Hyper Tool Multi Language"],
            answer: 1
        },
        {
            question: "Who developed Python?",
            options: ["Guido van Rossum", "James Gosling", "Dennis Ritchie", "Bjarne Stroustrup"],
            answer: 0
        },
        {
            question: "What does CSS stand for?",
            options: ["Common Style Sheet", "Colorful Style Sheet", "Computer Style Sheet", "Cascading Style Sheet"],
            answer: 3
        },
        {
            question: "Which of the following is not a JavaScript framework?",
            options: ["React", "Vue", "Angular", "Django"],
            answer: 3
        },
        {
            question: "What does API stand for?",
            options: ["Application Programming Interface", "Application Process Integration", "Apple Programming Interface", "Advanced Peripheral Integration"],
            answer: 0
        }
    ],
    gk: [
        {
            question: "What is the capital of France?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            answer: 2
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Jupiter", "Mars", "Venus"],
            answer: 2
        },
        {
            question: "Who wrote 'Romeo and Juliet'?",
            options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
            answer: 1
        },
        {
            question: "What is the largest ocean on Earth?",
            options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
            answer: 3
        },
        {
            question: "How many continents are there?",
            options: ["5", "6", "7", "8"],
            answer: 2
        }
    ],
    movies: [
        {
            question: "Who directed 'Inception'?",
            options: ["Steven Spielberg", "Christopher Nolan", "Martin Scorsese", "Quentin Tarantino"],
            answer: 1
        },
        {
            question: "Which movie features the quote 'I'll be back'?",
            options: ["The Terminator", "Die Hard", "Rambo", "Rocky"],
            answer: 0
        },
        {
            question: "What is the name of the hobbit played by Elijah Wood in Lord of the Rings?",
            options: ["Sam", "Merry", "Pippin", "Frodo"],
            answer: 3
        },
        {
            question: "Which animated movie features a character named Simba?",
            options: ["Aladdin", "Mulan", "The Lion King", "Tarzan"],
            answer: 2
        },
        {
            question: "In The Matrix, does Neo take the blue pill or the red pill?",
            options: ["Blue Pill", "Red Pill", "Green Pill", "Yellow Pill"],
            answer: 1
        }
    ]
};

// State Variables
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let playerName = "";
let selectedCategory = "";
let timerInterval;
let timeLeft = 15;
const SECONDS_PER_QUESTION = 15;

// DOM Elements
const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const playerNameInput = document.getElementById('player-name');
const categorySelect = document.getElementById('category-select');
const startBtn = document.getElementById('start-btn');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');

const currentScoreEl = document.getElementById('current-score');
const timeLeftEl = document.getElementById('time-left');
const timerDisplay = document.querySelector('.timer-display');
const progressBar = document.getElementById('progress-bar');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');

const resultIcon = document.getElementById('result-icon');
const resultMessage = document.getElementById('result-message');
const finalScoreEl = document.getElementById('final-score');
const totalQuestionsEl = document.getElementById('total-questions');
const leaderboardList = document.getElementById('leaderboard-list');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('quiz-theme');
    if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('quiz-theme', 'dark');
    } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('quiz-theme', 'light');
    }
});

// Audio Synthesizer Engine (Optional sound effects)
const audioCtxContainer = { ctx: null };

function playSound(type) {
    try {
        if (!audioCtxContainer.ctx) {
            audioCtxContainer.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const audioCtx = audioCtxContainer.ctx;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (type === 'correct') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
            oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'wrong') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        } else if (type === 'end') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
            oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.6);
        }
    } catch (e) {
        console.log("Audio not supported or disabled");
    }
}

// Navigation Functions
function switchScreen(hideScreen, showScreen) {
    hideScreen.classList.remove('active');
    hideScreen.classList.add('hidden');
    showScreen.classList.remove('hidden');
    // small reflow hack to trigger animation
    void showScreen.offsetWidth;
    showScreen.classList.add('active');
}

// Start Quiz Logic
startBtn.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    selectedCategory = categorySelect.value;

    if (!playerName) {
        alert("Please enter your name to begin!");
        playerNameInput.focus();
        return;
    }

    if (!selectedCategory) {
        alert("Please select a category!");
        categorySelect.focus();
        return;
    }

    // Initialize Quiz
    currentQuestions = [...quizData[selectedCategory]];
    // Optional: shuffle questions
    currentQuestions.sort(() => Math.random() - 0.5);
    
    currentQuestionIndex = 0;
    score = 0;
    currentScoreEl.textContent = score;
    
    // Resume audio context on first user interaction
    if (audioCtxContainer.ctx && audioCtxContainer.ctx.state === 'suspended') {
        audioCtxContainer.ctx.resume();
    } else if (!audioCtxContainer.ctx) {
        try { audioCtxContainer.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    }
    
    switchScreen(startScreen, quizScreen);
    loadQuestion();
});

// Load Question Logic
function loadQuestion() {
    clearInterval(timerInterval);
    timeLeft = SECONDS_PER_QUESTION;
    updateTimerDisplay();
    startTimer();

    const currentQ = currentQuestions[currentQuestionIndex];
    questionText.textContent = currentQ.question;
    
    // Update progress bar
    const progressPercent = ((currentQuestionIndex) / currentQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Clear previous options
    optionsContainer.innerHTML = '';
    nextBtn.classList.add('hidden');

    currentQ.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.innerHTML = `<span>${option}</span> <i class="fas icon"></i>`;
        button.onclick = () => checkAnswer(index, button);
        optionsContainer.appendChild(button);
    });
}

// Check Answer Logic
function checkAnswer(selectedIndex, selectedButton) {
    clearInterval(timerInterval);
    const currentQ = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQ.answer;

    const allOptions = optionsContainer.querySelectorAll('.option-btn');
    
    // Disable all options
    allOptions.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        selectedButton.classList.add('correct');
        selectedButton.querySelector('.icon').classList.add('fa-check-circle');
        score++;
        currentScoreEl.textContent = score;
        playSound('correct');
    } else {
        selectedButton.classList.add('wrong');
        selectedButton.querySelector('.icon').classList.add('fa-times-circle');
        playSound('wrong');
        
        // Highlight correct answer
        const correctButton = allOptions[currentQ.answer];
        correctButton.classList.add('correct');
        correctButton.querySelector('.icon').classList.add('fa-check-circle');
    }

    nextBtn.classList.remove('hidden');
}

// Timer Logic
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timeLeftEl.textContent = timeLeft;
    if (timeLeft <= 3) {
        timerDisplay.classList.add('danger');
    } else {
        timerDisplay.classList.remove('danger');
    }
}

function handleTimeOut() {
    const currentQ = currentQuestions[currentQuestionIndex];
    const allOptions = optionsContainer.querySelectorAll('.option-btn');
    
    allOptions.forEach(btn => btn.disabled = true);
    
    // Highlight correct answer
    const correctButton = allOptions[currentQ.answer];
    correctButton.classList.add('correct');
    correctButton.querySelector('.icon').classList.add('fa-check-circle');
    playSound('wrong');

    nextBtn.classList.remove('hidden');
}

// Next Question Logic
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
});

// End Quiz Logic
function endQuiz() {
    playSound('end');
    
    // Update progress bar to 100%
    progressBar.style.width = '100%';
    
    setTimeout(() => {
        switchScreen(quizScreen, resultScreen);
        
        finalScoreEl.textContent = score;
        totalQuestionsEl.textContent = currentQuestions.length;

        const percentage = score / currentQuestions.length;
        
        if (percentage === 1) {
            resultMessage.textContent = "Perfect! 🎉";
            resultIcon.className = "fas fa-crown text-yellow";
        } else if (percentage >= 0.7) {
            resultMessage.textContent = "Excellent! ✨";
            resultIcon.className = "fas fa-medal text-yellow";
        } else if (percentage >= 0.5) {
            resultMessage.textContent = "Good job! 👍";
            resultIcon.className = "fas fa-thumbs-up text-accent";
        } else {
            resultMessage.textContent = "Try again! 😅";
            resultIcon.className = "fas fa-brain text-accent";
        }

        saveToLeaderboard();
        updateLeaderboardUI();
    }, 500);
}

// Leaderboard Logic
function saveToLeaderboard() {
    const newEntry = {
        name: playerName,
        score: score,
        total: currentQuestions.length,
        category: categorySelect.options[categorySelect.selectedIndex].text,
        date: new Date().toLocaleDateString()
    };

    let leaderboard = JSON.parse(localStorage.getItem('quiz-leaderboard')) || [];
    leaderboard.push(newEntry);
    
    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep top 5
    leaderboard = leaderboard.slice(0, 5);
    
    localStorage.setItem('quiz-leaderboard', JSON.stringify(leaderboard));
}

function updateLeaderboardUI() {
    const leaderboard = JSON.parse(localStorage.getItem('quiz-leaderboard')) || [];
    leaderboardList.innerHTML = '';

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>No scores yet. Be the first!</li>';
        return;
    }

    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        
        let medal = '';
        if (index === 0) medal = '<i class="fas fa-medal text-yellow"></i>';
        else if (index === 1) medal = '<i class="fas fa-medal" style="color: #94a3b8"></i>';
        else if (index === 2) medal = '<i class="fas fa-medal" style="color: #b45309"></i>';
        else medal = `<span style="opacity: 0.5">#${index+1}</span>`;

        li.innerHTML = `
            <span>${medal} <strong>${entry.name}</strong> <small>(${entry.category})</small></span>
            <strong>${entry.score}/${entry.total}</strong>
        `;
        leaderboardList.appendChild(li);
    });
}

// View Leaderboard directly from start screen
viewLeaderboardBtn.addEventListener('click', () => {
    switchScreen(startScreen, resultScreen);
    // Hide result message stuff, just show leaderboard
    document.getElementById('result-message').style.display = 'none';
    document.querySelector('.final-score-text').style.display = 'none';
    document.querySelector('.result-icon').style.display = 'none';
    updateLeaderboardUI();
});

// Restart & Home Logic
restartBtn.addEventListener('click', () => {
    // Reset result screen view overrides if any
    document.getElementById('result-message').style.display = 'block';
    document.querySelector('.final-score-text').style.display = 'block';
    document.querySelector('.result-icon').style.display = 'block';
    
    // Use same settings
    currentQuestionIndex = 0;
    score = 0;
    currentScoreEl.textContent = score;
    switchScreen(resultScreen, quizScreen);
    loadQuestion();
});

homeBtn.addEventListener('click', () => {
    // Reset result screen view overrides if any
    document.getElementById('result-message').style.display = 'block';
    document.querySelector('.final-score-text').style.display = 'block';
    document.querySelector('.result-icon').style.display = 'block';
    
    // Clear inputs
    playerNameInput.value = '';
    categorySelect.value = '';
    switchScreen(resultScreen, startScreen);
});

// Init
initTheme();
