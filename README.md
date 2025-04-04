# Trivia Bot with Puzzle Games

A web application featuring various puzzle games including Memory Match, Pattern Memory, Word Scramble, Number Slider, and Code Breaker.

## Features

- Memory Match: Find matching pairs of emojis
- Pattern Memory: Repeat a sequence of lit tiles
- Word Scramble: Unscramble programming-related words
- Number Slider: Arrange numbers in order by sliding tiles
- Code Breaker: Guess the correct sequence of colors

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Start the Flask server:
```bash
python app.py
```

3. Open `index.html` in your web browser or use a local development server.

## Project Structure

- `app.py`: Flask server with API endpoints
- `puzzle_games.py`: Python classes for game logic
- `puzzles.js`: Frontend JavaScript for game interactions
- `styles.css`: Styling for the games
- `index.html`: Main HTML file
- `requirements.txt`: Python dependencies

## API Endpoints

### Memory Game
- POST `/api/memory/start`: Start a new game
- POST `/api/memory/flip`: Flip a card

### Pattern Game
- POST `/api/pattern/start`: Start a new game
- POST `/api/pattern/check`: Check a player's sequence

### Word Scramble
- POST `/api/word/start`: Get a new scrambled word
- POST `/api/word/check`: Check a player's answer

### Slider Game
- POST `/api/slider/start`: Start a new game
- POST `/api/slider/move`: Move a tile

### Code Breaker
- POST `/api/code/start`: Start a new game
- POST `/api/code/select`: Select a color
- POST `/api/code/check`: Check the current attempt

## Development

The application uses:
- Flask for the backend server
- Vanilla JavaScript for frontend interactions
- CSS for styling
- HTML5 for structure 