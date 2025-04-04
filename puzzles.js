// Base URL for API endpoints
const API_BASE_URL = 'http://localhost:5000';

// Game initialization handler
function initializePuzzleGames() {
    // Add event listeners for game buttons
    document.querySelectorAll('.start-puzzle-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const gameType = e.target.closest('.puzzle-card').dataset.game;

            // Hide all game containers
            document.querySelectorAll('.puzzle-container').forEach(container => {
                container.classList.add('hidden');
            });

            // Show selected game container
            const gameContainer = document.getElementById(`${gameType}-game`);
            if (gameContainer) {
                gameContainer.classList.remove('hidden');
            }

            // Initialize the selected game
            switch (gameType) {
                case 'pattern':
                    startPatternGame();
                    break;
                case 'memory':
                    new MemoryGame();
                    break;
                case 'word-scramble':
                    new WordScramble();
                    break;
                case 'slider':
                    new SliderGame();
                    break;
                case 'codebreaker':
                    new CodeBreaker();
                    break;
            }
        });
    });

    // Add event listeners for game controls
    document.querySelectorAll('.restart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const gameType = e.target.closest('.puzzle-container').id.replace('-game', '');
            // Show robot guide encouragement message
            robotGuide.showMessage('encouragement');
            switch (gameType) {
                case 'memory':
                    new MemoryGame();
                    break;
                case 'slider':
                    new SliderGame();
                    break;
                case 'codebreaker':
                    new CodeBreaker();
                    break;
            }
        });
    });

    // Word Scramble specific controls
    const wordScrambleCheckBtn = document.querySelector('#word-scramble-game .check-btn');
    const nextWordBtn = document.querySelector('#word-scramble-game .next-word-btn');
    
    if (wordScrambleCheckBtn) {
        wordScrambleCheckBtn.addEventListener('click', () => {
            const game = new WordScramble();
            game.checkAnswer();
        });
    }
    
    if (nextWordBtn) {
        nextWordBtn.addEventListener('click', () => {
            robotGuide.showMessage('word');
            new WordScramble();
        });
    }

    // Pattern Game specific controls
    const startSequenceBtn = document.querySelector('#pattern-game .start-sequence');
    if (startSequenceBtn) {
        startSequenceBtn.addEventListener('click', () => {
            robotGuide.showMessage('pattern');
            startPatternGame();
        });
    }

    // Code Breaker specific controls
    const codeBreakerCheckBtn = document.querySelector('#codebreaker-game .check-btn');
    const newGameBtn = document.querySelector('#codebreaker-game .new-game-btn');
    
    if (codeBreakerCheckBtn) {
        codeBreakerCheckBtn.addEventListener('click', () => {
            const game = new CodeBreaker();
            game.checkCode();
        });
    }
    
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            robotGuide.showMessage('codebreaker');
            new CodeBreaker();
        });
    }
}

// Memory Match Game
class MemoryGame {
    constructor() {
        this.gameContainer = document.getElementById('memory-game');
        this.grid = this.gameContainer.querySelector('.memory-grid');
        this.movesDisplay = this.gameContainer.querySelector('.moves');
        this.restartButton = this.gameContainer.querySelector('.restart-btn');
        this.cards = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎮', '🎲', '🎯'];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.canFlip = true;
        
        this.init();
        
        // Add event listener for restart button
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => this.init());
        }
    }

    async init() {
        try {
            // Reset game state
            this.flippedCards = [];
            this.matchedPairs = 0;
            this.moves = 0;
            this.canFlip = true;
            this.updateMoves();
            
            // Clear the grid
            this.grid.innerHTML = '';
            
            // Shuffle cards
            const shuffledCards = [...this.cards].sort(() => Math.random() - 0.5);
            
            // Create card elements
            shuffledCards.forEach((symbol, index) => {
                const card = document.createElement('div');
                card.className = 'memory-card';
                card.dataset.index = index;
                card.dataset.symbol = symbol;
                
                card.innerHTML = `
                    <div class="card-inner">
                        <div class="card-front"></div>
                        <div class="card-back">${symbol}</div>
                    </div>
                `;
                
                card.addEventListener('click', () => this.handleCardClick(card));
                this.grid.appendChild(card);
            });
        } catch (error) {
            console.error('Error initializing memory game:', error);
        }
    }

    handleCardClick(card) {
        if (!this.canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        this.flipCard(card);

        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.moves++;
            this.updateMoves();
            
            const [firstCard, secondCard] = this.flippedCards;
            
            if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
                // Match found
                this.matchedPairs++;
                firstCard.classList.add('matched');
                secondCard.classList.add('matched');
                this.flippedCards = [];
                this.canFlip = true;
                
                if (this.matchedPairs === this.cards.length / 2) {
                    setTimeout(() => this.handleGameComplete(), 500);
                }
            } else {
                // No match
                setTimeout(() => {
                    this.unflipCards();
                    this.canFlip = true;
                }, 1000);
            }
        }
    }

    flipCard(card) {
        card.classList.add('flipped');
        this.flippedCards.push(card);
    }

    unflipCards() {
        this.flippedCards.forEach(card => card.classList.remove('flipped'));
        this.flippedCards = [];
    }

    updateMoves() {
        if (this.movesDisplay) {
            this.movesDisplay.textContent = `Moves: ${this.moves}`;
        }
    }

    handleGameComplete() {
        alert(`Congratulations! You completed the game in ${this.moves} moves!`);
        this.init();
    }
}

// Word Scramble Game
class WordScramble {
    constructor() {
        this.gameContainer = document.getElementById('word-scramble');
        this.scrambledWordDisplay = document.getElementById('scrambled-word');
        this.scoreDisplay = document.getElementById('word-score');
        this.init();
    }

    async init() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/word/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            this.renderWord(data.scrambled_word);
        } catch (error) {
            console.error('Error initializing word scramble:', error);
            alert('Failed to start word scramble. Please try again.');
        }
    }

    async checkAnswer() {
        const input = document.querySelector('.word-input').value;
        try {
            const response = await fetch(`${API_BASE_URL}/api/word/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answer: input })
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            this.updateScore(data.score);
            return data.correct;
        } catch (error) {
            console.error('Error checking answer:', error);
            return false;
        }
    }

    renderWord(word) {
        document.querySelector('.scrambled-word').textContent = word;
        document.querySelector('.word-input').value = '';
        document.querySelector('.check-btn').classList.remove('hidden');
        document.querySelector('.next-word-btn').classList.add('hidden');
    }

    updateScore(score) {
        document.querySelector('.score').textContent = `Score: ${score}`;
    }
}

// Number Slider Game
class SliderGame {
    constructor() {
        this.gameContainer = document.getElementById('slider-game');
        this.tilesContainer = document.getElementById('slider-tiles');
        this.movesDisplay = document.getElementById('slider-moves');
        this.init();
    }

    async init() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/slider/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            this.renderTiles(data.tiles);
        } catch (error) {
            console.error('Error initializing slider game:', error);
            alert('Failed to start slider game. Please try again.');
        }
    }

    async moveTile(index) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/slider/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ index })
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            this.updateMoves(data.moves);
            this.renderTiles(data.tiles);
            return data.solved;
        } catch (error) {
            console.error('Error moving tile:', error);
            return false;
        }
    }

    renderTiles(tiles) {
        const grid = document.querySelector('.slider-grid');
        grid.innerHTML = '';
        tiles.forEach((number, index) => {
            const tile = document.createElement('div');
            tile.className = `slider-tile${number === null ? ' empty' : ''}`;
            tile.textContent = number || '';
            tile.addEventListener('click', () => this.moveTile(index));
            grid.appendChild(tile);
        });
    }

    updateMoves(moves) {
        document.querySelector('.moves').textContent = `Moves: ${moves}`;
    }
}

// Pattern Memory Game
class PatternGame {
    constructor() {
        this.grid = document.querySelector('.pattern-grid');
        this.levelDisplay = document.getElementById('pattern-level');
        this.startButton = document.querySelector('.start-sequence');
        this.sequence = [];
        this.playerSequence = [];
        this.currentLevel = 0;
        this.isPlayerTurn = false;

        this.init();
    }

    init() {
        // Reset game state
        this.sequence = [];
        this.playerSequence = [];
        this.currentLevel = 0;
        this.isPlayerTurn = false;

        // Add event listeners to grid cells
        this.grid.querySelectorAll('.pattern-cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handlePlayerInput(e));
        });

        // Update level display
        this.updateLevel();
    }

    startGame() {
        this.sequence = [];
        this.playerSequence = [];
        this.currentLevel = 0;
        this.isPlayerTurn = false;
        this.nextLevel();
    }

    nextLevel() {
        this.currentLevel++;
        this.updateLevel();
        this.playerSequence = [];
        this.isPlayerTurn = false;

        // Add a new random cell to the sequence
        const randomCell = Math.floor(Math.random() * 9) + 1;
        this.sequence.push(randomCell);

        // Show the sequence to the player
        this.showSequence();
    }

    showSequence() {
        let index = 0;
        const cells = this.grid.querySelectorAll('.pattern-cell');

        const interval = setInterval(() => {
            if (index < this.sequence.length) {
                const cellIndex = this.sequence[index] - 1;
                cells[cellIndex].classList.add('active');
                setTimeout(() => cells[cellIndex].classList.remove('active'), 500);
                index++;
            } else {
                clearInterval(interval);
                this.isPlayerTurn = true;
            }
        }, 800);
    }

    handlePlayerInput(event) {
        if (!this.isPlayerTurn) return;

        const cell = event.target;
        const cellIndex = parseInt(cell.dataset.cell);

        // Add the player's input to their sequence
        this.playerSequence.push(cellIndex);

        // Check if the player's input matches the sequence
        if (this.playerSequence[this.playerSequence.length - 1] !== this.sequence[this.playerSequence.length - 1]) {
            alert('Game Over! You reached Level ' + this.currentLevel);
            this.startGame();
            return;
        }

        // If the player completes the sequence, go to the next level
        if (this.playerSequence.length === this.sequence.length) {
            this.isPlayerTurn = false;
            setTimeout(() => this.nextLevel(), 1000);
        }
    }

    updateLevel() {
        this.levelDisplay.textContent = this.currentLevel;
    }
}

// Initialize the Pattern Memory game
function startPatternGame() {
    const game = new PatternGame();
    game.startGame();
}

// Code Breaker Game
class CodeBreaker {
    constructor() {
        this.gameContainer = document.getElementById('code-breaker');
        this.codeGrid = document.getElementById('code-grid');
        this.attemptsDisplay = document.getElementById('code-attempts');
        this.init();
    }

    async init() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/code/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            this.renderGame();
        } catch (error) {
            console.error('Error initializing code breaker:', error);
            alert('Failed to start code breaker. Please try again.');
        }
    }

    async selectColor(color) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/code/select`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ color })
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data.current_attempt;
        } catch (error) {
            console.error('Error selecting color:', error);
            return null;
        }
    }

    async checkCode() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/code/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            this.updateAttempts(data.attempts);
            return {
                feedback: data.feedback,
                win: data.win,
                lose: data.lose
            };
        } catch (error) {
            console.error('Error checking code:', error);
            return { feedback: null, win: false, lose: false };
        }
    }

    renderGame() {
        const codeGrid = document.querySelector('.code-grid');
        codeGrid.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const slot = document.createElement('div');
            slot.className = 'code-slot';
            codeGrid.appendChild(slot);
        }

        const colorPicker = document.querySelector('.color-picker');
        colorPicker.innerHTML = '';
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange'].forEach(color => {
            const option = document.createElement('div');
            option.className = 'color-option';
            option.style.backgroundColor = color;
            option.addEventListener('click', () => this.selectColor(color));
            colorPicker.appendChild(option);
        });

        const guessHistory = document.querySelector('.guess-history');
        guessHistory.innerHTML = '';
    }

    updateAttempts(attempts) {
        const guessHistory = document.querySelector('.guess-history');
        guessHistory.innerHTML = '';
        attempts.forEach(attempt => {
            const guessRow = document.createElement('div');
            guessRow.className = 'guess-row';
            
            const guessSlots = document.createElement('div');
            guessSlots.className = 'guess-slots';
            attempt.code.forEach(color => {
                const slot = document.createElement('div');
                slot.className = 'guess-slot';
                slot.style.backgroundColor = color;
                guessSlots.appendChild(slot);
            });
            
            const feedbackPegs = document.createElement('div');
            feedbackPegs.className = 'feedback-pegs';
            for (let i = 0; i < attempt.feedback.correct; i++) {
                const peg = document.createElement('div');
                peg.className = 'feedback-peg correct';
                feedbackPegs.appendChild(peg);
            }
            for (let i = 0; i < attempt.feedback.wrong_position; i++) {
                const peg = document.createElement('div');
                peg.className = 'feedback-peg wrong-position';
                feedbackPegs.appendChild(peg);
            }
            
            guessRow.appendChild(guessSlots);
            guessRow.appendChild(feedbackPegs);
            guessHistory.insertBefore(guessRow, guessHistory.firstChild);
        });
    }
}

class RobotGuide {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'robot-guide show';
        
        this.avatar = document.createElement('div');
        this.avatar.className = 'robot-avatar';
        
        this.face = document.createElement('div');
        this.face.className = 'robot-face';
        
        this.eyes = document.createElement('div');
        this.eyes.className = 'robot-eyes';
        
        const leftEye = document.createElement('div');
        leftEye.className = 'robot-eye';
        
        const rightEye = document.createElement('div');
        rightEye.className = 'robot-eye';
        
        this.eyes.appendChild(leftEye);
        this.eyes.appendChild(rightEye);
        
        this.mouth = document.createElement('div');
        this.mouth.className = 'robot-mouth';
        
        this.face.appendChild(this.eyes);
        this.face.appendChild(this.mouth);
        
        this.avatar.appendChild(this.face);
        
        this.message = document.createElement('div');
        this.message.className = 'robot-message';
        
        this.container.appendChild(this.avatar);
        this.container.appendChild(this.message);
        
        document.body.appendChild(this.container);
        
        this.messages = {
            welcome: [
                "Welcome to the Trivia Bot! I'm here to help you learn and have fun!",
                "Hey there! Ready to test your knowledge?",
                "Let's learn something new today!"
            ],
            memory: [
                "Memory games are great for your brain!",
                "Focus on the pattern and remember it well!",
                "Take your time to memorize the sequence!"
            ],
            pattern: [
                "Watch carefully and follow the pattern!",
                "Pattern recognition is a key skill!",
                "Let's see if you can spot the sequence!"
            ],
            word: [
                "Unscramble these words to test your vocabulary!",
                "Word games are fun and educational!",
                "Challenge yourself with these word puzzles!"
            ],
            slider: [
                "Slide the pieces to solve the puzzle!",
                "Arrange the numbers in order!",
                "Test your spatial reasoning skills!"
            ],
            codebreaker: [
                "Crack the code using your logic!",
                "Use the hints wisely to solve the code!",
                "Think carefully about each guess!"
            ],
            trivia: [
                "Test your knowledge with these questions!",
                "Learn something new with each question!",
                "Challenge yourself with interesting facts!"
            ],
            success: [
                "Great job! You're doing amazing!",
                "Excellent work! Keep it up!",
                "You're on fire! Keep going!"
            ],
            encouragement: [
                "You can do it! Keep trying!",
                "Don't give up! You're getting closer!",
                "Every attempt makes you better!"
            ],
            gameStart: [
                "Let's begin! Good luck!",
                "Ready to start? Here we go!",
                "Time to put your skills to the test!"
            ],
            gameOver: [
                "Well played! Want to try again?",
                "That was fun! Ready for another round?",
                "Great effort! Let's play again!"
            ],
            random: [
                "You're making great progress!",
                "Learning is fun, isn't it?",
                "Keep pushing your limits!",
                "You're getting better every time!",
                "Your brain is getting stronger!",
                "Challenge accepted!",
                "Let's make learning exciting!",
                "You're doing fantastic!",
                "Every puzzle solved is a victory!",
                "Your determination is inspiring!"
            ]
        };
        
        this.startBlinking();
        this.startRandomMessages();
    }
    
    showMessage(type) {
        const messageList = this.messages[type] || this.messages.encouragement;
        const randomMessage = messageList[Math.floor(Math.random() * messageList.length)];
        this.message.textContent = randomMessage;
        this.container.classList.add('message-highlight');
        this.animateRobot(type);
        
        setTimeout(() => {
            this.container.classList.remove('message-highlight');
        }, 1000);
    }
    
    animateRobot(type) {
        this.face.className = 'robot-face';
        switch(type) {
            case 'success':
            case 'gameStart':
                this.face.classList.add('happy');
                break;
            case 'encouragement':
                this.face.classList.add('supportive');
                break;
            case 'random':
                this.face.classList.add('excited');
                break;
            default:
                this.face.classList.add('focused');
        }
    }
    
    blink() {
        const eyes = this.eyes.querySelectorAll('.robot-eye');
        eyes.forEach(eye => eye.classList.add('blink'));
        
        setTimeout(() => {
            eyes.forEach(eye => eye.classList.remove('blink'));
        }, 150);
    }
    
    startBlinking() {
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance to blink
                this.blink();
            }
        }, 3000);
    }
    
    startRandomMessages() {
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance to show a random message
                this.showMessage('random');
            }
        }, Math.random() * 15000 + 15000); // Random interval between 15-30 seconds
    }
}

// Initialize the robot guide
const robotGuide = new RobotGuide();

// Initialize games when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializePuzzleGames();
    // Show welcome message
    robotGuide.showMessage('welcome');
});