export const FLAMES_MAP = {
  F: {
    label: 'Friends',
    emoji: '🤝',
    desc: "A bond built on trust and laughter. You are each other's safe haven.",
    color: '#4cc9f0'
  },
  L: {
    label: 'Lovers',
    emoji: '💕',
    desc: 'A passionate connection that transcends time. Your hearts beat as one.',
    color: '#ff4d6d'
  },
  A: {
    label: 'Affectionate',
    emoji: '🥰',
    desc: 'Deep care and warmth. You bring out the softest parts of each other.',
    color: '#ff8fa3'
  },
  M: {
    label: 'Marriage',
    emoji: '💍',
    desc: 'A lifelong commitment. Building a beautiful future together, hand in hand.',
    color: '#ffd166'
  },
  E: {
    label: 'Enemies',
    emoji: '⚔️',
    desc: "A complex dynamic. Perhaps there's a thin line between love and hate.",
    color: '#ef476f'
  },
  S: {
    label: 'Siblings',
    emoji: '👫',
    desc: 'A protective and familiar love. You understand each other like family.',
    color: '#06d6a0'
  }
};

/**
 * Extracts normalized letters/graphemes from a string.
 * Handles Unicode, Tamil, Hindi, accented characters, while stripping
 * digits, symbols, spaces, and punctuation.
 *
 * @param {string} name
 * @returns {string[]}
 */
export function extractLetters(name) {
  if (!name || typeof name !== 'string') return [];
  const normalized = name.normalize('NFC').trim();
  if (!normalized) return [];

  // Use Intl.Segmenter if available to keep compound graphemes intact (e.g. Indic scripts)
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return [...segmenter.segment(normalized)]
        .map(s => s.segment.toLowerCase())
        .filter(s => /\p{L}/u.test(s));
    } catch {
      // Fall through to regex if segmenter fails
    }
  }

  // Regex fallback matching Unicode letters and combining marks
  const matches = normalized.toLowerCase().match(/[\p{L}\p{M}]/gu);
  return matches || [];
}

/**
 * Calculates letter cancellation between two names.
 *
 * @param {string} name1
 * @param {string} name2
 */
export function calculateWorking(name1, name2) {
  const letters1 = extractLetters(name1);
  const letters2 = extractLetters(name2);

  if (letters1.length === 0 || letters2.length === 0) {
    return {
      isValid: false,
      error: 'Please enter valid names with at least one letter.',
      letters1,
      letters2,
      commonLetters: [],
      remaining1: [],
      remaining2: [],
      count: 0
    };
  }

  const temp2 = [...letters2];
  const commonLetters = [];
  const remaining1 = [];

  for (const char of letters1) {
    const idx = temp2.indexOf(char);
    if (idx !== -1) {
      commonLetters.push(char);
      temp2.splice(idx, 1);
    } else {
      remaining1.push(char);
    }
  }

  const remaining2 = temp2;
  const count = remaining1.length + remaining2.length;

  return {
    isValid: true,
    error: null,
    letters1,
    letters2,
    commonLetters,
    remaining1,
    remaining2,
    count
  };
}

/**
 * Computes the FLAMES elimination steps and final result.
 *
 * @param {number} count
 * @returns {{
 *   result: string,
 *   steps: Array<{ round: number, eliminated: string, remainingAfter: string[] }>,
 *   isZeroCount: boolean,
 *   note?: string
 * }}
 */
export function solveFlames(count) {
  if (count === 0) {
    return {
      result: 'F',
      steps: [],
      isZeroCount: true,
      note: 'All letters matched perfectly (0 remaining)! By tradition, identical or full anagram bonds start and end at Friends (or Twin Flames).'
    };
  }

  let flames = ['F', 'L', 'A', 'M', 'E', 'S'];
  const steps = [];
  let currentPos = 0;
  let round = 1;

  while (flames.length > 1) {
    currentPos = (currentPos + count - 1) % flames.length;
    const eliminated = flames.splice(currentPos, 1)[0];
    steps.push({
      round,
      eliminated,
      remainingAfter: [...flames]
    });
    round++;
  }

  return {
    result: flames[0],
    steps,
    isZeroCount: false,
    note: null
  };
}

