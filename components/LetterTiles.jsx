import React from 'react';

const LETTERS = ['F', 'L', 'A', 'M', 'E', 'S'];

export default function LetterTiles({ eliminatedLetters = [], currentPointer = null, result = null }) {
  return (
    <div className="flames-letters" aria-hidden="true">
      {LETTERS.map((letter) => {
        const isEliminated = eliminatedLetters.includes(letter);
        const isPointer = currentPointer === letter;
        const isFinal = result === letter;

        return (
          <div
            key={letter}
            className={`letter-tile handwriting ${isPointer ? 'active-pointer' : ''} ${
              isEliminated ? 'eliminated' : ''
            } ${isFinal ? 'final-reveal' : ''}`}
          >
            {letter}
            {isEliminated && <div className="pencil-scratch scratch-anim" />}
          </div>
        );
      })}
    </div>
  );
}
