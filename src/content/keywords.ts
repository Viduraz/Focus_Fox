/**
 * FocusFox — Smart Highlights Keywords Configuration
 *
 * Defines the keyword lists for different study categories and constructs
 * matching regex patterns.
 */

export interface KeywordCategory {
  name: string;
  className: string;
  keywords: string[];
}

export const KEYWORDS_MAP: Record<string, KeywordCategory> = {
  important: {
    name: 'Important',
    className: 'focusfox-highlight-important',
    keywords: ['important', 'key', 'must know', 'critical']
  },
  definition: {
    name: 'Definition',
    className: 'focusfox-highlight-definition',
    keywords: ['definition', 'means', 'refers to', 'is defined as']
  },
  exam: {
    name: 'Exam',
    className: 'focusfox-highlight-exam',
    keywords: ['exam', 'question', 'assessment', 'quiz', 'test']
  },
  formula: {
    name: 'Formula',
    className: 'focusfox-highlight-formula',
    keywords: ['formula', 'calculate', 'equation'] // '=' is handled by a special pattern
  },
  note: {
    name: 'Note',
    className: 'focusfox-highlight-note',
    keywords: ['note', 'remember', 'important note']
  }
};

/**
 * Returns a compiled global, case-insensitive regular expression
 * that matches all the defined study keywords and the formula equals sign.
 */
export function getCombinedRegex(): RegExp {
  const allWords: string[] = [];
  Object.values(KEYWORDS_MAP).forEach((cat) => {
    allWords.push(...cat.keywords);
  });
  
  // Sort phrases by length descending to match 'is defined as' or 'important note' before 'note'
  allWords.sort((a, b) => b.length - a.length);

  // Escape special regex characters in keywords
  const escapedWords = allWords.map((word) => 
    word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  );

  // Join words/phrases with word boundaries
  const wordPattern = `\\b(${escapedWords.join('|')})\\b`;
  
  // Special formula equals sign pattern: matches '=' when surrounded by spaces
  const formulaPattern = `(\\s+=\\s+)`;

  // Combine patterns
  return new RegExp(`${wordPattern}|${formulaPattern}`, 'gi');
}

/**
 * Resolves the matching category for a piece of text (case-insensitive).
 */
export function getCategoryForWord(word: string): string {
  const cleanWord = word.trim().toLowerCase();
  
  if (cleanWord === '=') {
    return 'formula';
  }

  for (const [key, category] of Object.entries(KEYWORDS_MAP)) {
    if (category.keywords.some((k) => k.toLowerCase() === cleanWord)) {
      return key;
    }
  }

  // Fallback check: if word contains any keyword or matches partially
  for (const [key, category] of Object.entries(KEYWORDS_MAP)) {
    if (category.keywords.some((k) => cleanWord.includes(k.toLowerCase()))) {
      return key;
    }
  }

  return 'important'; // default fallback
}
