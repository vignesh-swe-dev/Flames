import { describe, it, expect } from 'vitest';
import { extractLetters, calculateWorking, solveFlames, FLAMES_MAP } from '../lib/flames';

describe('FLAMES Algorithm', () => {
  describe('extractLetters', () => {
    it('handles spaces and normal English names', () => {
      expect(extractLetters('  John   Doe  ')).toEqual(['j', 'o', 'h', 'n', 'd', 'o', 'e']);
    });

    it('strips punctuation, digits, and special characters', () => {
      expect(extractLetters('Alex 123!@#')).toEqual(['a', 'l', 'e', 'x']);
    });

    it('handles Unicode and Tamil input', () => {
      const tamilLetters = extractLetters('அன்பு');
      expect(tamilLetters.length).toBeGreaterThan(0);
      expect(tamilLetters).toEqual(['அ', 'ன்', 'பு']);
    });

    it('handles Hindi input', () => {
      const hindiLetters = extractLetters('नमस्ते');
      expect(hindiLetters.length).toBeGreaterThan(0);
    });

    it('returns empty array when input contains no letters', () => {
      expect(extractLetters('12345 !@#$%')).toEqual([]);
      expect(extractLetters('')).toEqual([]);
      expect(extractLetters(null)).toEqual([]);
    });
  });

  describe('calculateWorking', () => {
    it('handles identical names with zero remaining count', () => {
      const working = calculateWorking('Alex', 'Alex');
      expect(working.isValid).toBe(true);
      expect(working.count).toBe(0);
      expect(working.commonLetters).toEqual(['a', 'l', 'e', 'x']);
      expect(working.remaining1).toEqual([]);
      expect(working.remaining2).toEqual([]);
    });

    it('handles names with no common letters', () => {
      const working = calculateWorking('ABC', 'DEF');
      expect(working.isValid).toBe(true);
      expect(working.commonLetters).toEqual([]);
      expect(working.count).toBe(6);
      expect(working.remaining1).toEqual(['a', 'b', 'c']);
      expect(working.remaining2).toEqual(['d', 'e', 'f']);
    });

    it('handles repeated letters accurately', () => {
      // Name 1: "Sam" ('s', 'a', 'm')
      // Name 2: "Samantha" ('s', 'a', 'm', 'a', 'n', 't', 'h', 'a')
      // Common: 's', 'a', 'm' (only 1 'a' in Sam)
      // Remaining 1: 0
      // Remaining 2: 'a', 'n', 't', 'h', 'a' (5 letters)
      // Count: 0 + 5 = 5
      const working = calculateWorking('Sam', 'Samantha');
      expect(working.isValid).toBe(true);
      expect(working.commonLetters).toEqual(['s', 'a', 'm']);
      expect(working.remaining1).toEqual([]);
      expect(working.remaining2).toEqual(['a', 'n', 't', 'h', 'a']);
      expect(working.count).toBe(5);
    });

    it('handles leading, trailing, and embedded spaces', () => {
      const working = calculateWorking('  Mary   Jane  ', ' Jane   Watson ');
      expect(working.isValid).toBe(true);
      expect(working.commonLetters).toContain('j');
      expect(working.commonLetters).toContain('a');
      expect(working.commonLetters).toContain('n');
      expect(working.commonLetters).toContain('e');
    });

    it('returns error when one or both inputs have no letters', () => {
      const working = calculateWorking('12345', 'John');
      expect(working.isValid).toBe(false);
      expect(working.error).toBeTruthy();
    });
  });

  describe('solveFlames', () => {
    it('handles count = 0 deliberately with note and Friends result', () => {
      const solution = solveFlames(0);
      expect(solution.result).toBe('F');
      expect(solution.isZeroCount).toBe(true);
      expect(solution.note).toContain('0 remaining');
    });

    it('correctly calculates known elimination sequences', () => {
      // For count = 5:
      // Round 1 (F L A M E S, count 5) -> eliminates 'E'
      // Round 2 (F L A M S, from E pos, count 5) -> eliminates 'M'
      // Round 3 (F L A S, count 5) -> eliminates 'S'
      // Round 4 (F L A, count 5) -> eliminates 'L'
      // Round 5 (F A, count 5) -> eliminates 'A'
      // Winner: 'F'
      const solution = solveFlames(5);
      expect(solution.result).toBe('F');
      expect(solution.steps.map(s => s.eliminated)).toEqual(['E', 'M', 'S', 'L', 'A']);
    });

    it('resolves all outcomes in FLAMES_MAP', () => {
      const outcomes = new Set();
      for (let count = 1; count <= 20; count++) {
        const { result } = solveFlames(count);
        outcomes.add(result);
        expect(FLAMES_MAP[result]).toBeDefined();
        expect(FLAMES_MAP[result].label).toBeTruthy();
      }
      expect(outcomes.size).toBeGreaterThan(1);
    });
  });
});
