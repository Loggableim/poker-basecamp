/**
 * hand-eval.js — 5-Card Poker Hand Evaluator
 * Liefert einen numerischen Score (höher = besser) + Beschreibung
 */

const SUITS = ['s','h','d','c'];
const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const RANK_VALUES = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,
                      'T':10,'J':11,'Q':12,'K':13,'A':14 };

const HAND_NAMES = [
  'High Card', 'One Pair', 'Two Pair', 'Three of a Kind',
  'Straight', 'Flush', 'Full House', 'Four of a Kind',
  'Straight Flush', 'Royal Flush'
];

// Hand-Rank-Konstanten
const HAND = {
  HIGH_CARD: 0,
  ONE_PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  FOUR_OF_A_KIND: 7,
  STRAIGHT_FLUSH: 8,
  ROYAL_FLUSH: 9
};

function getRankValue(rank) {
  return RANK_VALUES[rank] || 0;
}

/**
 * Bewertet 5 Karten und gibt { score, handRank, handName, kickers } zurück.
 * @param {Array} cards - Array von 5 Karten {rank, suit}
 */
function evaluateHand(cards) {
  if (!cards || cards.length !== 5) {
    return { score: -1, handRank: -1, handName: 'Invalid', kickers: [] };
  }

  // Nach Rank-Wert sortieren (absteigend)
  const sorted = cards.map(c => ({ ...c, val: getRankValue(c.rank) }))
                      .sort((a, b) => b.val - a.val);

  const vals = sorted.map(c => c.val);
  const suits = sorted.map(c => c.suit);

  // Flush-Check
  const isFlush = suits.every(s => s === suits[0]);

  // Straight-Check
  let isStraight = false;
  let straightHigh = vals[0];

  // Normale Straße: 5 aufeinanderfolgende
  if (vals[0] - vals[4] === 4 && new Set(vals).size === 5) {
    isStraight = true;
  }
  // Sonderfall: A-2-3-4-5 (A=14, aber Straße mit 5 als High)
  if (vals[0] === 14 && vals[1] === 5 && vals[2] === 4 && vals[3] === 3 && vals[4] === 2) {
    isStraight = true;
    straightHigh = 5; // 5-high straight
  }

  // Duplikate zählen
  const counts = {};
  for (const v of vals) {
    counts[v] = (counts[v] || 0) + 1;
  }
  const groups = Object.entries(counts)
    .map(([val, cnt]) => ({ val: parseInt(val), cnt }))
    .sort((a, b) => b.cnt - a.cnt || b.val - a.val);

  // Hand erkennen
  let handRank, kickers;

  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      handRank = HAND.ROYAL_FLUSH; // Royal Flush
    } else {
      handRank = HAND.STRAIGHT_FLUSH;
    }
    kickers = [straightHigh];
  } else if (groups[0].cnt === 4) {
    handRank = HAND.FOUR_OF_A_KIND;
    // Quad-Rank + Kicker
    const quadVal = groups[0].val;
    const kicker = groups[1] ? groups[1].val : 0;
    kickers = [quadVal, kicker];
  } else if (groups[0].cnt === 3 && groups[1] && groups[1].cnt === 2) {
    handRank = HAND.FULL_HOUSE;
    kickers = [groups[0].val, groups[1].val];
  } else if (isFlush) {
    handRank = HAND.FLUSH;
    kickers = vals; // alle 5 Karten als Kicker
  } else if (isStraight) {
    handRank = HAND.STRAIGHT;
    kickers = [straightHigh];
  } else if (groups[0].cnt === 3) {
    handRank = HAND.THREE_OF_A_KIND;
    const tripVal = groups[0].val;
    const rest = groups.slice(1).map(g => g.val).sort((a,b) => b-a);
    kickers = [tripVal, ...rest];
  } else if (groups[0].cnt === 2 && groups[1] && groups[1].cnt === 2) {
    handRank = HAND.TWO_PAIR;
    const pairs = [groups[0].val, groups[1].val].sort((a,b) => b-a);
    const kicker = groups[2] ? groups[2].val : 0;
    kickers = [...pairs, kicker];
  } else if (groups[0].cnt === 2) {
    handRank = HAND.ONE_PAIR;
    const pairVal = groups[0].val;
    const rest = groups.slice(1).map(g => g.val).sort((a,b) => b-a);
    kickers = [pairVal, ...rest];
  } else {
    handRank = HAND.HIGH_CARD;
    kickers = vals;
  }

  // Score berechnen: HandRank (5 Bits) + Kickers (je 5 Bits, max 5 Kickers)
  let score = handRank << 20;
  for (let i = 0; i < Math.min(kickers.length, 5); i++) {
    score |= (kickers[i] & 0x1F) << (15 - i * 5);
  }

  return {
    score,
    handRank,
    handName: HAND_NAMES[handRank],
    kickers
  };
}

/**
 * Vergleicht zwei Hand-Ergebnisse.
 * @returns {number} 1 wenn handA gewinnt, -1 wenn handB gewinnt, 0 bei Gleichstand
 */
function compareHands(handA, handB) {
  if (handA.score > handB.score) return 1;
  if (handA.score < handB.score) return -1;
  return 0;
}

export {
  SUITS, RANKS, RANK_VALUES,
  HAND, HAND_NAMES,
  evaluateHand, compareHands
};
