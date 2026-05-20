/**
 * range-parser.js — Range-Strings ↔ Grid-Zellen
 *
 * Grid: 13×13 Matrix
 *   Zeilen/Spalten: 2,3,4,5,6,7,8,9,T,J,Q,K,A
 *   Diagonale (i===j) = Paare (z.B. AA, KK, ...)
 *   Oberhalb Diagonale (i<j) = suited (z.B. AKs, AQs)
 *   Unterhalb Diagonale (i>j) = offsuit (z.B. AKo, AQo)
 *
 * Klick-Zustände einer Zelle:
 *   0 = nicht selected
 *   1 = suited (oberhalb Diag) / offsuit (unterhalb Diag) / pair (Diag)
 *   2 = offsuit (nur bei i!==j) — bei Paaren nicht relevant
 */

const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const RANK_INDEX = Object.fromEntries(RANKS.map((r, i) => [r, i]));

// Mapping: Hand-String → Grid-Indizes
// "AKs" → { r1: 'A', r2: 'K', suited: true }
// "AKo" → { r1: 'A', r2: 'K', suited: false }
// "QQ"  → { r1: 'Q', r2: 'Q', pair: true }

function parseHandString(s) {
  s = s.trim().toUpperCase();
  if (!s) return null;

  // Paare: "AA", "KK", "QQ", etc.
  if (/^([2-9TJQKA])\1$/.test(s)) {
    const r = s[0];
    if (RANK_INDEX[r] === undefined) return null;
    return [{ r1: r, r2: r, suited: true }]; // pair
  }

  // Mit Suffix: "AKs", "AKo"
  const match = s.match(/^([2-9TJQKA])([2-9TJQKA])([so]?)$/);
  if (match) {
    const [, r1, r2, suffix] = match;
    if (RANK_INDEX[r1] === undefined || RANK_INDEX[r2] === undefined) return null;
    if (r1 === r2) {
      // Paar
      return [{ r1, r2, suited: true }];
    }
    if (suffix === 's') return [{ r1, r2, suited: true }];
    if (suffix === 'o') return [{ r1, r2, suited: false }];
    // Kein Suffix: beide (suited + offsuit)
    return [
      { r1, r2, suited: true },
      { r1, r2, suited: false }
    ];
  }

  return null;
}

/**
 * Parst einen Range-String in ein Set von Grid-Positionen
 * Beispiele: "AKs, AKo, QQ+" oder "TT+, AQs+"
 *
 * @param {string} rangeStr
 * @returns {Array<{r1:string, r2:string, suited:boolean}>}
 */
function parseRangeString(rangeStr) {
  if (!rangeStr || !rangeStr.trim()) return [];
  const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
  const result = [];
  const seen = new Set();

  for (const part of parts) {
    if (part.includes('+')) {
      // Bereich wie "QQ+" oder "AKs+" oder "A2s+"
      const base = part.slice(0, -1).trim();
      const baseParsed = parseHandString(base);
      if (!baseParsed || baseParsed.length === 0) continue;

      const first = baseParsed[0];
      const idx1 = RANK_INDEX[first.r1];
      const idx2 = RANK_INDEX[first.r2];
      if (idx1 === undefined || idx2 === undefined) continue;

      const isSuited = first.suited;
      const isOffsuit = !first.suited && baseParsed.length > 1 && baseParsed[1] && !baseParsed[1].suited;
      const isPair = first.r1 === first.r2;

      if (isPair) {
        // QQ+ = QQ, KK, AA
        for (let i = idx1; i < RANKS.length; i++) {
          addCombos(result, seen, RANKS[i], RANKS[i], true);
        }
      } else if (isSuited && !isOffsuit) {
        // AQs+ = AQs, AKs (A-high suited, Q-K)
        // Für suited: r1 > r2 (obere Dreieck)
        // A2s+ = A2s, A3s, ... AKs
        if (idx1 > idx2) {
          for (let j = idx2; j < idx1; j++) {
            addCombos(result, seen, RANKS[idx1], RANKS[j], true);
          }
        }
      } else {
        // ATo+ = ATo, AJo, AQo, AKo
        if (idx1 > idx2) {
          for (let j = idx2; j < idx1; j++) {
            addCombos(result, seen, RANKS[idx1], RANKS[j], false);
          }
        }
      }
    } else {
      const parsed = parseHandString(part);
      if (parsed) {
        for (const p of parsed) {
          addCombos(result, seen, p.r1, p.r2, p.suited);
        }
      }
    }
  }

  return result;
}

function addCombos(arr, seen, r1, r2, suited) {
  const key = `${r1}|${r2}|${suited}`;
  if (!seen.has(key)) {
    seen.add(key);
    arr.push({ r1, r2, suited });
  }
}

/**
 * Konvertiert eine Liste von {r1, r2, suited} in einen Range-String
 */
function combosToRangeString(combos) {
  if (!combos || combos.length === 0) return '';

  // Gruppieren
  const suitedMap = new Map();
  const offsuitMap = new Map();
  const pairs = [];

  for (const c of combos) {
    if (c.r1 === c.r2) {
      pairs.push(c.r1);
    } else if (c.suited) {
      const key = c.r1 + c.r2;
      suitedMap.set(key, c);
    } else {
      const key = c.r1 + c.r2;
      offsuitMap.set(key, c);
    }
  }

  const parts = [];

  // Paare: nach Wert sortieren
  if (pairs.length > 0) {
    const sortedPairs = [...new Set(pairs)].sort((a, b) => RANK_INDEX[a] - RANK_INDEX[b]);
    // Gruppiere in Bereiche
    const pairRanges = toRanges(sortedPairs.map(r => RANK_INDEX[r]));
    for (const range of pairRanges) {
      parts.push(RANKS[range[0]] + RANKS[range[0]] + (range.length > 1 ? '+' : ''));
    }
  }

  // Suited Combos
  const suitedKeys = [...suitedMap.keys()].sort((a, b) => {
    const a1 = RANK_INDEX[a[0]], a2 = RANK_INDEX[a[1]];
    const b1 = RANK_INDEX[b[0]], b2 = RANK_INDEX[b[1]];
    return b1 - a1 || b2 - a2;
  });
  for (const key of suitedKeys) {
    parts.push(key + 's');
  }

  // Offsuit Combos
  const offsuitKeys = [...offsuitMap.keys()].sort((a, b) => {
    const a1 = RANK_INDEX[a[0]], a2 = RANK_INDEX[a[1]];
    const b1 = RANK_INDEX[b[0]], b2 = RANK_INDEX[b[1]];
    return b1 - a1 || b2 - a2;
  });
  for (const key of offsuitKeys) {
    parts.push(key + 'o');
  }

  return parts.join(', ');
}

function toRanges(indices) {
  if (indices.length === 0) return [];
  const ranges = [];
  let start = indices[0];
  let end = indices[0];
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === end + 1) {
      end = indices[i];
    } else {
      ranges.push(Array.from({ length: end - start + 1 }, (_, k) => start + k));
      start = indices[i];
      end = indices[i];
    }
  }
  ranges.push(Array.from({ length: end - start + 1 }, (_, k) => start + k));
  return ranges;
}

/**
 * Berechnet die Anzahl Combos für eine Range
 */
function countCombos(combos) {
  let count = 0;
  for (const c of combos) {
    if (c.r1 === c.r2) count += 6; // Paare: 6 Combos
    else if (c.suited) count += 4;  // suited: 4 Combos
    else count += 12;               // offsuit: 12 Combos
  }
  return count;
}

export {
  RANKS, RANK_INDEX,
  parseHandString,
  parseRangeString,
  combosToRangeString,
  countCombos,
  toRanges
};
