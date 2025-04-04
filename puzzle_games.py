import random
from typing import List, Tuple, Dict, Optional

class MemoryGame:
    def __init__(self):
        self.cards = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎮', '🎲', '🎯']
        self.flipped_cards = []
        self.moves = 0
        self.matched_pairs = 0

    def shuffle_cards(self) -> List[str]:
        return random.sample(self.cards, len(self.cards))

    def flip_card(self, index: int) -> Tuple[Optional[bool], int]:
        if len(self.flipped_cards) < 2 and index not in self.flipped_cards:
            self.flipped_cards.append(index)
            self.moves += 1
            if len(self.flipped_cards) == 2:
                if self.cards[self.flipped_cards[0]] == self.cards[self.flipped_cards[1]]:
                    self.matched_pairs += 1
                    self.flipped_cards = []
                    return True, self.moves
                else:
                    return False, self.moves
        return None, self.moves

    def reset_game(self):
        self.flipped_cards = []
        self.moves = 0
        self.matched_pairs = 0
        self.cards = self.shuffle_cards()

class PatternGame:
    def __init__(self):
        self.sequence = []
        self.current_level = 1
        self.player_sequence = []
        self.game_over = False

    def generate_sequence(self) -> List[int]:
        """Generate a new sequence based on the current level"""
        self.sequence = [random.randint(0, 8) for _ in range(self.current_level)]
        return self.sequence

    def check_sequence(self, tile_index: int) -> Tuple[bool, bool]:
        """Check if the clicked tile matches the sequence
        Returns (correct, game_over)"""
        try:
            self.player_sequence.append(tile_index)
            sequence_index = len(self.player_sequence) - 1
            
            # Check if the tile matches the sequence
            if self.player_sequence[sequence_index] != self.sequence[sequence_index]:
                self.game_over = True
                return False, True
            
            # Check if the sequence is complete
            if len(self.player_sequence) == len(self.sequence):
                self.current_level += 1
                self.player_sequence = []
                return True, True
            
            return True, False
            
        except Exception as e:
            print(f"Error in check_sequence: {str(e)}")
            return False, True

    def reset_game(self):
        """Reset the game state"""
        self.sequence = []
        self.current_level = 1
        self.player_sequence = []
        self.game_over = False

class WordScramble:
    def __init__(self):
        self.words = ['PUZZLE', 'GAME', 'TRIVIA', 'MEMORY', 'BRAIN', 'CHALLENGE']
        self.current_word = ''
        self.score = 0

    def get_next_word(self) -> str:
        self.current_word = random.choice(self.words)
        return self.scramble_word(self.current_word)

    def scramble_word(self, word: str) -> str:
        return ''.join(random.sample(word, len(word)))

    def check_answer(self, answer: str) -> Tuple[bool, int]:
        if answer.upper() == self.current_word:
            self.score += 1
            return True, self.score
        return False, self.score

    def reset_game(self):
        self.current_word = ''
        self.score = 0

class SliderGame:
    def __init__(self):
        self.tiles = list(range(1, 16)) + [None]
        self.moves = 0
        self.solved = False

    def shuffle_tiles(self) -> List[Optional[int]]:
        self.tiles = random.sample(self.tiles, len(self.tiles))
        return self.tiles

    def move_tile(self, index: int) -> Tuple[List[Optional[int]], bool, int]:
        empty_index = self.tiles.index(None)
        if self.is_valid_move(index, empty_index):
            self.tiles[empty_index], self.tiles[index] = self.tiles[index], self.tiles[empty_index]
            self.moves += 1
            self.solved = self.check_solution()
            return self.tiles, self.solved, self.moves
        return self.tiles, self.solved, self.moves

    def is_valid_move(self, index: int, empty_index: int) -> bool:
        row = index // 4
        col = index % 4
        empty_row = empty_index // 4
        empty_col = empty_index % 4
        return (abs(row - empty_row) == 1 and col == empty_col) or (abs(col - empty_col) == 1 and row == empty_row)

    def check_solution(self) -> bool:
        return all(self.tiles[i] == i + 1 for i in range(15)) and self.tiles[15] is None

    def reset_game(self):
        self.tiles = list(range(1, 16)) + [None]
        self.moves = 0
        self.solved = False

class CodeBreaker:
    def __init__(self):
        self.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
        self.code = []
        self.attempts = []
        self.current_attempt = []
        self.max_attempts = 10

    def generate_code(self) -> List[str]:
        self.code = [random.choice(self.colors) for _ in range(4)]
        return self.code

    def select_color(self, color: str) -> List[str]:
        if len(self.current_attempt) < 4:
            self.current_attempt.append(color)
        return self.current_attempt

    def check_code(self) -> Tuple[Optional[Dict[str, int]], bool, bool]:
        if len(self.current_attempt) != 4:
            return None, False, False

        feedback = self.get_feedback()
        self.attempts.append({
            'code': self.current_attempt.copy(),
            'feedback': feedback
        })
        self.current_attempt = []

        if feedback['correct'] == 4:
            return feedback, True, False
        if len(self.attempts) >= self.max_attempts:
            return feedback, False, True
        return feedback, False, False

    def get_feedback(self) -> Dict[str, int]:
        correct = 0
        wrong_position = 0
        code_copy = self.code.copy()
        attempt_copy = self.current_attempt.copy()

        for i in range(4):
            if attempt_copy[i] == code_copy[i]:
                correct += 1
                code_copy[i] = attempt_copy[i] = None

        for i in range(4):
            if attempt_copy[i] is not None:
                if attempt_copy[i] in code_copy:
                    wrong_position += 1
                    code_copy[code_copy.index(attempt_copy[i])] = None

        return {'correct': correct, 'wrong_position': wrong_position}

    def reset_game(self):
        self.code = []
        self.attempts = []
        self.current_attempt = [] 