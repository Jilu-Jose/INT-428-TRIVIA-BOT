let gameState = {
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    streak: 0,
    showAnswer: false,
    gameStarted: false,
    timeLeft: 30,
    timer: null,
    isLoggedIn: false,
    username: ''
};

// Authentication functions
function toggleLogin() {
    const loginModal = document.getElementById('login-modal');
    loginModal.classList.toggle('hidden');
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordToggle = passwordInput.nextElementSibling.querySelector('i');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.setAttribute('data-lucide', 'eye-off');
    } else {
        passwordInput.type = 'password';
        passwordToggle.setAttribute('data-lucide', 'eye');
    }
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        alert(`Welcome, ${username}!`);
        toggleLogin();
    } else {
        alert('Please enter both username and password.');
    }
}

function logout() {
    gameState.isLoggedIn = false;
    gameState.username = '';
    updateAuthUI();
}

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('login-btn');
    const userMenu = document.getElementById('user-menu');
    
    if (user) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        
        const username = document.getElementById('menu-username');
        if (username) {
            username.textContent = user.username;
        }
    } else {
        loginBtn.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

// Handle social login
async function handleSocialLogin(provider) {
    try {
        // Here you would integrate with the actual social login provider
        // For now, we'll simulate a successful login
        const mockUser = {
            username: `user_${Math.random().toString(36).substr(2, 9)}`,
            provider: provider
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        updateAuthUI();
        toggleLogin();
        
        // Show success message
        showNotification(`Successfully logged in with ${provider}!`, 'success');
    } catch (error) {
        showNotification('Failed to login with ' + provider, 'error');
    }
}

// Handle forgot password
function handleForgotPassword(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    
    if (!username) {
        showNotification('Please enter your username first', 'error');
        return;
    }
    
    // Here you would make an API call to handle password reset
    showNotification('Password reset instructions sent to your email', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add show class after a small delay to trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Game functions
async function fetchQuestions() {
    try {
        const category = document.getElementById('category')?.value;
        const difficulty = document.getElementById('difficulty')?.value;
        
        if (!category || !difficulty) {
            console.error('Category or difficulty not found:', { category, difficulty });
            throw new Error('Failed to get category or difficulty');
        }
        
        console.log('Fetching questions with:', { category, difficulty });
        
        const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;
        console.log('API URL:', url);
        
        const response = await fetch(url);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (data.response_code !== 0) {
            console.error('API Error code:', data.response_code);
            throw new Error(`Failed to fetch questions: ${data.response_code}`);
        }
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No questions received from API');
        }
        
        return data.results;
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to fetch questions. Please try again.');
        return [];
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startTimer() {
    clearInterval(gameState.timer);
    gameState.timeLeft = 30;
    updateTimer();

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();

        if (gameState.timeLeft === 0) {
            handleAnswer('');
            clearInterval(gameState.timer);
        }
    }, 1000);
}

function updateTimer() {
    document.getElementById('timer').textContent = gameState.timeLeft + 's';
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

async function startGame() {
    try {
        console.log('Starting game...');
        const startBtn = document.getElementById('start-btn');
        if (!startBtn) {
            throw new Error('Start button not found');
        }
        
        startBtn.disabled = true;
        startBtn.textContent = 'Loading...';
        
        const questions = await fetchQuestions();
        console.log('Fetched questions:', questions);
        
        if (!questions || questions.length === 0) {
            throw new Error('No questions available');
        }
        
        gameState = {
            ...gameState,
            questions,
            currentQuestionIndex: 0,
            score: 0,
            streak: 0,
            showAnswer: false,
            gameStarted: true
        };
        
        showScreen('game-screen');
        displayQuestion();
    } catch (error) {
        console.error('Error starting game:', error);
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Start Game';
        }
        alert('Failed to start game. Please try again.');
    }
}

function displayQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    const answers = shuffleArray([question.correct_answer, ...question.incorrect_answers]);

    document.getElementById('current-category').textContent = `Category: ${question.category}`;
    document.getElementById('question-number').textContent = `Question ${gameState.currentQuestionIndex + 1} of ${gameState.questions.length}`;
    document.getElementById('question-text').innerHTML = question.question;
    document.getElementById('score').textContent = `${gameState.score} / ${gameState.questions.length}`;
    document.getElementById('streak').textContent = `${gameState.streak} 🔥`;

    const answersContainer = document.getElementById('answers');
    answersContainer.innerHTML = '';
    
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-button';
        button.innerHTML = answer;
        button.onclick = () => handleAnswer(answer);
        answersContainer.appendChild(button);
    });

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('next-button').classList.add('hidden');

    startTimer();
}

function handleAnswer(answer) {
    if (gameState.showAnswer) return;

    clearInterval(gameState.timer);
    gameState.showAnswer = true;

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    if (isCorrect) {
        gameState.score++;
        gameState.streak++;
    } else {
        gameState.streak = 0;
    }

    const feedback = document.getElementById('feedback');
    feedback.innerHTML = isCorrect
        ? '<i data-lucide="check-circle-2"></i><p>Correct! Well done!</p>'
        : `<i data-lucide="x-circle"></i><p>Incorrect! The correct answer was: ${currentQuestion.correct_answer}</p>`;
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.classList.remove('hidden');

    const buttons = document.querySelectorAll('.answer-button');
    buttons.forEach(button => {
        if (button.innerHTML === currentQuestion.correct_answer) {
            button.classList.add('correct');
        } else if (button.innerHTML === answer && !isCorrect) {
            button.classList.add('incorrect');
        }
        button.disabled = true;
    });

    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
        document.getElementById('next-button').classList.remove('hidden');
    } else {
        endGame();
    }

    lucide.createIcons();
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

function nextQuestion() {
    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
        gameState.currentQuestionIndex++;
        gameState.showAnswer = false;
        displayQuestion();
    }
}

function endGame() {
    const gameOverContent = document.querySelector('.game-over-content');
    const finalScore = gameState.score;
    const passingScore = 6;
    
    // Clear any existing celebration/message elements
    const existingCelebration = gameOverContent.querySelector('.celebration');
    const existingMessage = gameOverContent.querySelector('.result-message');
    if (existingCelebration) existingCelebration.remove();
    if (existingMessage) existingMessage.remove();

    // Create result message
    const messageDiv = document.createElement('div');
    messageDiv.className = `result-message ${finalScore >= passingScore ? 'success-message' : 'failure-message'}`;
    
    if (finalScore >= passingScore) {
        messageDiv.textContent = '🎉 Congratulations! 🎉';
        createConfetti();
    } else {
        messageDiv.textContent = 'Better luck next time!';
    }
    
    // Insert message at the top of the content
    gameOverContent.insertBefore(messageDiv, gameOverContent.firstChild);

    // Update final stats
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-streak').textContent = gameState.streak;
    
    showScreen('game-over-screen');
}

function restartGame() {
    showScreen('welcome-screen');
    gameState.gameStarted = false;
    
    // Reset start button
    const startBtn = document.getElementById('start-btn');
    startBtn.disabled = false;
    startBtn.textContent = 'Start Game';
}

// Mock data for leaderboard (since we don't have a backend)
const mockLeaderboardData = [
    { rank: 1, username: "TriviaMaster", score: 98, streak: 15, category: "General Knowledge" },
    { rank: 2, username: "QuizWizard", score: 95, streak: 12, category: "Science: Computers" },
    { rank: 3, username: "BrainiacPro", score: 92, streak: 10, category: "Sports" },
    { rank: 4, username: "TriviaKing", score: 90, streak: 9, category: "General Knowledge" },
    { rank: 5, username: "QuizChampion", score: 88, streak: 8, category: "Science: Computers" },
    { rank: 6, username: "MindMaster", score: 85, streak: 7, category: "Sports" },
    { rank: 7, username: "QuizExpert", score: 82, streak: 6, category: "General Knowledge" },
    { rank: 8, username: "BrainTeaser", score: 80, streak: 5, category: "Science: Computers" },
    { rank: 9, username: "TriviaGuru", score: 78, streak: 4, category: "Sports" },
    { rank: 10, username: "QuizMaster", score: 75, streak: 3, category: "General Knowledge" }
];

// Mock data for user profile
const mockProfileData = {
    totalGames: 42,
    averageScore: 85,
    bestStreak: 15,
    recentGames: [
        { date: "2024-02-20", category: "General Knowledge", score: 9, streak: 5 },
        { date: "2024-02-19", category: "Science: Computers", score: 8, streak: 4 },
        { date: "2024-02-18", category: "Sports", score: 7, streak: 3 },
        { date: "2024-02-17", category: "General Knowledge", score: 10, streak: 6 },
        { date: "2024-02-16", category: "Science: Computers", score: 9, streak: 5 }
    ]
};

// Function to update leaderboard
function updateLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    const category = document.getElementById('leaderboard-category').value;
    const timeframe = document.getElementById('leaderboard-timeframe').value;

    // Filter data based on category (in a real app, this would be done server-side)
    let filteredData = mockLeaderboardData;
    if (category !== 'all') {
        const categoryName = document.querySelector(`#leaderboard-category option[value="${category}"]`).textContent;
        filteredData = mockLeaderboardData.filter(entry => entry.category === categoryName);
    }

    filteredData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.rank}</td>
            <td>${entry.username}</td>
            <td>${entry.score}%</td>
            <td>${entry.streak} 🔥</td>
            <td>${entry.category}</td>
        `;
        tbody.appendChild(row);
    });
}

// Function to update profile
function updateProfile() {
    if (gameState.isLoggedIn) {
        document.getElementById('profile-username').textContent = gameState.username;
        document.getElementById('profile-total-games').textContent = mockProfileData.totalGames;
        document.getElementById('profile-avg-score').textContent = mockProfileData.averageScore + '%';
        document.getElementById('profile-best-streak').textContent = mockProfileData.bestStreak;

        const recentGamesList = document.getElementById('recent-games-list');
        recentGamesList.innerHTML = '';

        mockProfileData.recentGames.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <div class="game-card-header">
                    <span class="game-date">${game.date}</span>
                    <span class="game-category">${game.category}</span>
                </div>
                <div class="game-card-stats">
                    <span class="game-score">Score: ${game.score}/10</span>
                    <span class="game-streak">Streak: ${game.streak} 🔥</span>
                </div>
            `;
            recentGamesList.appendChild(gameCard);
        });
    } else {
        document.getElementById('profile-username').textContent = 'Guest User';
        document.getElementById('profile-total-games').textContent = '0';
        document.getElementById('profile-avg-score').textContent = '0%';
        document.getElementById('profile-best-streak').textContent = '0';
        document.getElementById('recent-games-list').innerHTML = '<p class="login-prompt">Please log in to view your game history.</p>';
    }
}

// Add event listeners for navigation
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing application...');
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
            console.log('Lucide icons initialized');
        } else {
            console.error('Lucide not loaded properly');
        }
        
        // Initialize start button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', startGame);
            console.log('Start button initialized');
        } else {
            console.error('Start button not found');
        }
        
        // Initialize navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    const page = e.target.dataset.page;
                    console.log('Navigating to:', page);
                    
                    // Update active link
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    // Show appropriate screen
                    if (page === 'home') {
                        showScreen('welcome-screen');
                    } else if (page === 'leaderboard') {
                        showScreen('leaderboard-screen');
                        updateLeaderboard();
                    } else if (page === 'profile') {
                        showScreen('profile-screen');
                        updateProfile();
                    } else if (page === 'puzzles') {
                        showScreen('puzzles-screen');
                    }
                } catch (error) {
                    console.error('Navigation error:', error);
                }
            });
        });
        
        updateAuthUI();
        
        // Add event listeners for social login buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.provider;
                handleSocialLogin(provider);
            });
        });
        
        // Add event listener for forgot password
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', handleForgotPassword);
        }

        // Initialize chatbot
        const chatbotContainer = document.getElementById('chatbot-container');
        const chatbotMessages = document.getElementById('chatbot-messages');
        const chatbotInput = document.getElementById('chatbot-input');
        const chatbotSend = document.getElementById('chatbot-send');

        // Toggle chatbot visibility
        document.getElementById('chatbot-header').addEventListener('click', () => {
            chatbotContainer.classList.toggle('hidden');
        });

        // Send message to chatbot
        chatbotSend.addEventListener('click', async () => {
            const message = document.getElementById('chatbot-input').value.trim();
            if (!message) return;

            // Display user's message
            const userMessage = document.createElement('div');
            userMessage.textContent = `You: ${message}`;
            document.getElementById('chatbot-messages').appendChild(userMessage);

            // Send message to backend
            try {
                const response = await fetch('/api/chatbot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });

                const data = await response.json();
                if (data.reply) {
                    // Display chatbot's reply
                    const botMessage = document.createElement('div');
                    botMessage.textContent = `Bot: ${data.reply}`;
                    document.getElementById('chatbot-messages').appendChild(botMessage);
                } else {
                    throw new Error('No reply from chatbot');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });

        console.log('Application initialization complete');
    } catch (error) {
        console.error('Fatal error during initialization:', error);
    }
});