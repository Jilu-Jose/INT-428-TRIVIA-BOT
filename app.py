from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from puzzle_games import MemoryGame, PatternGame, WordScramble, SliderGame, CodeBreaker
from typing import Dict, Any
import os
import openai

app = Flask(__name__)
CORS(app)

# Set your OpenAI API key
openai.api_key = "your_openai_api_key"

# Initialize game instances
memory_game = MemoryGame()
pattern_game = PatternGame()
word_scramble = WordScramble()
slider_game = SliderGame()
code_breaker = CodeBreaker()

# Serve index.html at root
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Handle static files
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# Handle favicon request
@app.route('/favicon.ico')
def favicon():
    return '', 204

# Memory Game endpoints
@app.route('/api/memory/start', methods=['POST'])
def memory_start() -> Dict[str, Any]:
    try:
        memory_game.reset_game()
        return jsonify({'cards': memory_game.shuffle_cards()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/memory/flip', methods=['POST'])
def memory_flip() -> Dict[str, Any]:
    try:
        data = request.json
        if not data or 'index' not in data:
            return jsonify({'error': 'Missing index parameter'}), 400
        result, moves = memory_game.flip_card(data['index'])
        return jsonify({'result': result, 'moves': moves})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Pattern Game endpoints
@app.route('/api/pattern/start', methods=['POST'])
def pattern_start():
    try:
        pattern_game.reset_game()
        sequence = pattern_game.generate_sequence()
        return jsonify({'sequence': sequence})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pattern/check', methods=['POST'])
def pattern_check():
    try:
        data = request.json
        if not data or 'tile_index' not in data:
            return jsonify({'error': 'Missing tile_index parameter'}), 400
            
        tile_index = data['tile_index']
        correct, game_over = pattern_game.check_sequence(tile_index)
        
        return jsonify({
            'correct': correct,
            'game_over': game_over,
            'level': pattern_game.current_level
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Word Scramble endpoints
@app.route('/api/word/start', methods=['POST'])
def word_start() -> Dict[str, Any]:
    try:
        word_scramble.reset_game()
        return jsonify({'scrambled_word': word_scramble.get_next_word()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/word/check', methods=['POST'])
def word_check() -> Dict[str, Any]:
    try:
        data = request.json
        if not data or 'answer' not in data:
            return jsonify({'error': 'Missing answer parameter'}), 400
        correct, score = word_scramble.check_answer(data['answer'])
        return jsonify({'correct': correct, 'score': score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Slider Game endpoints
@app.route('/api/slider/start', methods=['POST'])
def slider_start() -> Dict[str, Any]:
    try:
        slider_game.reset_game()
        return jsonify({'tiles': slider_game.shuffle_tiles()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/slider/move', methods=['POST'])
def slider_move() -> Dict[str, Any]:
    try:
        data = request.json
        if not data or 'index' not in data:
            return jsonify({'error': 'Missing index parameter'}), 400
        tiles, solved, moves = slider_game.move_tile(data['index'])
        return jsonify({'tiles': tiles, 'solved': solved, 'moves': moves})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Code Breaker endpoints
@app.route('/api/code/start', methods=['POST'])
def code_start() -> Dict[str, Any]:
    try:
        code_breaker.reset_game()
        return jsonify({'code': code_breaker.generate_code()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/code/select', methods=['POST'])
def code_select() -> Dict[str, Any]:
    try:
        data = request.json
        if not data or 'color' not in data:
            return jsonify({'error': 'Missing color parameter'}), 400
        current_attempt = code_breaker.select_color(data['color'])
        return jsonify({'current_attempt': current_attempt})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/code/check', methods=['POST'])
def code_check() -> Dict[str, Any]:
    try:
        feedback, win, lose = code_breaker.check_code()
        return jsonify({
            'feedback': feedback,
            'win': win,
            'lose': lose,
            'attempts': code_breaker.attempts
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chatbot endpoint
@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.json
        if not data or 'message' not in data:
            return jsonify({'error': 'Missing message parameter'}), 400

        # Send the user's message to OpenAI's GPT model
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for a trivia game."},
                {"role": "user", "content": data['message']}
            ]
        )

        # Extract the chatbot's reply
        reply = response['choices'][0]['message']['content']
        return jsonify({'reply': reply})
    except openai.error.OpenAIError as e:
        return jsonify({'error': f"OpenAI API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({'error': f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    # Create static folder if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
    app.run(debug=True, host='0.0.0.0', port=5000)

# Example usage of OpenAI API
try:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant for a trivia game."},
            {"role": "user", "content": "Hello, chatbot!"}
        ]
    )
    print(response['choices'][0]['message']['content'])
except Exception as e:
    print(f"Error: {e}")











