/**
 * equity-worker.js — WebWorker für Monte-Carlo-Equity-Simulation
 *
 * Empfängt: { heroHand, opponentCombos, board, iterations }
 * Sendet:   { wins, ties, losses, total, progress }
 */

// ---------- Karten-Logik ----------
const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const RANK_VALUES = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,
                      'T':10,'J':11,'Q':12,'K':13,'A':14 };
const SUITS = ['s','h','d','c'];

function getRankValue(r) { return RANK_VALUES[r] || 0; }

function createDeck() {
  const d = [];
  for (const s of SUITS) {
    for (const r of RANKS) d.push({ rank: r, suit: s, id: r + s });
  }
  return d;
}

function shuffleFisherYates(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function removeCards(deck, cardsToRemove) {
  const removeSet = new Set(cardsToRemove.map(c => c.id || (c.rank + c.suit)));
  return deck.filter(c => !removeSet.has(c.id || (c.rank + c.suit)));
}

function cardId(r, s) { return r + s; }

// ---------- Hand Evaluator ----------
const HAND_NAMES_EVAL = [
  'High Card', 'One Pair', 'Two Pair', 'Three of a Kind',
  'Straight', 'Flush', 'Full House', 'Four of a Kind',
  'Straight Flush', 'Royal Flush'
];

function evaluateHand(cards) {
  const sorted = cards.map(c => ({ ...c, val: getRankValue(c.rank) }))
                      .sort((a, b) => b.val - a.val);
  const vals = sorted.map(c => c.val);
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);

  let isStraight = false;
  let straightHigh = vals[0];
  if (vals[0] - vals[4] === 4 && new Set(vals).size === 5) {
    isStraight = true;
  }
  if (vals[0] === 14 && vals[1] === 5 && vals[2] === 4 && vals[3] === 3 && vals[4] === 2) {
    isStraight = true;
    straightHigh = 5;
  }

  const counts = {};
  for (const v of vals) counts[v] = (counts[v] || 0) + 1;
  const groups = Object.entries(counts)
    .map(([v, c]) => ({ val: parseInt(v), cnt: c }))
    .sort((a, b) => b.cnt - a.cnt || b.val - a.val);

  let handRank, kickers;

  if (isFlush && isStraight) {
    handRank = straightHigh === 14 ? 9 : 8;
    kickers = [straightHigh];
  } else if (groups[0].cnt === 4) {
    handRank = 7;
    kickers = [groups[0].val, groups[1] ? groups[1].val : 0];
  } else if (groups[0].cnt === 3 && groups[1] && groups[1].cnt === 2) {
    handRank = 6;
    kickers = [groups[0].val, groups[1].val];
  } else if (isFlush) {
    handRank = 5;
    kickers = vals;
  } else if (isStraight) {
    handRank = 4;
    kickers = [straightHigh];
  } else if (groups[0].cnt === 3) {
    handRank = 3;
    const rest = groups.slice(1).map(g => g.val).sort((a,b) => b-a);
    kickers = [groups[0].val, ...rest];
  } else if (groups[0].cnt === 2 && groups[1] && groups[1].cnt === 2) {
    handRank = 2;
    const pairs = [groups[0].val, groups[1].val].sort((a,b) => b-a);
    kickers = [...pairs, groups[2] ? groups[2].val : 0];
  } else if (groups[0].cnt === 2) {
    handRank = 1;
    const rest = groups.slice(1).map(g => g.val).sort((a,b) => b-a);
    kickers = [groups[0].val, ...rest];
  } else {
    handRank = 0;
    kickers = vals;
  }

  let score = handRank << 20;
  for (let i = 0; i < Math.min(kickers.length, 5); i++) {
    score |= (kickers[i] & 0x1F) << (15 - i * 5);
  }

  return { score, handRank, handName: HAND_NAMES_EVAL[handRank], kickers };
}

// ---------- Range-Hand-Generierung ----------
function comboToHands(combo) {
  // Erzeugt alle konkreten Kartenpaare für eine Kombination
  const { r1, r2, suited } = combo;
  const hands = [];

  if (r1 === r2) {
    // Paar: 6 Combos (z.B. A♠A♥, A♠A♦, A♠A♣, A♥A♦, A♥A♣, A♦A♣)
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        hands.push([
          { rank: r1, suit: SUITS[i], id: cardId(r1, SUITS[i]) },
          { rank: r1, suit: SUITS[j], id: cardId(r1, SUITS[j]) }
        ]);
      }
    }
  } else if (suited) {
    // Suited: 4 Combos
    for (const s of SUITS) {
      hands.push([
        { rank: r1, suit: s, id: cardId(r1, s) },
        { rank: r2, suit: s, id: cardId(r2, s) }
      ]);
    }
  } else {
    // Offsuit: 12 Combos
    for (const s1 of SUITS) {
      for (const s2 of SUITS) {
        if (s1 === s2) continue;
        hands.push([
          { rank: r1, suit: s1, id: cardId(r1, s1) },
          { rank: r2, suit: s2, id: cardId(r2, s2) }
        ]);
      }
    }
  }

  return hands;
}

// ---------- Worker-Message-Handler ----------
self.onmessage = function(e) {
  const { heroHand, opponentCombos, board, iterations } = e.data;

  let wins = 0, ties = 0, losses = 0;
  const total = iterations;
  const BATCH_SIZE = Math.max(1, Math.floor(iterations / 20));

  // Hero-Hand als Kartenobjekte
  const heroCards = heroHand.map(c => ({
    rank: c.rank, suit: c.suit, id: cardId(c.rank, c.suit)
  }));

  // Board-Karten
  const boardCards = (board || []).filter(b => b).map(c => ({
    rank: c.rank, suit: c.suit, id: cardId(c.rank, c.suit)
  }));

  // Alle Combos in konkrete Hände expandieren
  let allOpponentHands = [];
  for (const combo of opponentCombos) {
    allOpponentHands.push(...comboToHands(combo));
  }

  // Zufälliges Sampling aus Gegner-Händen (bei vielen Combos)
  // Wir nehmen die volle Range und wählen zufällig für jede Iteration

  for (let i = 0; i < total; i++) {
    // Zufällige Gegner-Hand auswählen
    const oppHand = allOpponentHands[Math.floor(Math.random() * allOpponentHands.length)];

    // Deck erstellen und bekannte Karten entfernen
    const deck = removeCards(createDeck(), [...heroCards, ...oppHand, ...boardCards]);
    shuffleFisherYates(deck);

    // Fehlende Board-Karten ziehen
    const needed = 5 - boardCards.length;
    const community = [...boardCards];
    if (needed > 0) {
      community.push(...deck.splice(0, needed));
    }

    // Hände bewerten (beste 5 aus 7)
    const heroBest = bestHandFromSeven(heroCards, community);
    const oppBest = bestHandFromSeven(oppHand, community);

    if (heroBest.score > oppBest.score) {
      wins++;
    } else if (heroBest.score < oppBest.score) {
      losses++;
    } else {
      ties++;
    }

    // Progress-Bericht
    if ((i + 1) % BATCH_SIZE === 0 || i === total - 1) {
      self.postMessage({
        type: 'progress',
        wins, ties, losses,
        done: i + 1,
        total
      });
    }
  }

  self.postMessage({
    type: 'result',
    wins, ties, losses,
    total
  });
};

/**
 * Beste 5-Karten-Hand aus 7 Karten (2 Hole + 5 Community)
 */
function bestHandFromSeven(hole, community) {
  const allCards = [...hole, ...community];
  if (allCards.length < 5) return evaluateHand(allCards);

  let best = null;
  // Alle 5-Karten-Kombinationen aus 7
  for (let i = 0; i < allCards.length; i++) {
    for (let j = i + 1; j < allCards.length; j++) {
      for (let k = j + 1; k < allCards.length; k++) {
        for (let l = k + 1; l < allCards.length; l++) {
          for (let m = l + 1; m < allCards.length; m++) {
            const hand = [allCards[i], allCards[j], allCards[k], allCards[l], allCards[m]];
            const result = evaluateHand(hand);
            if (!best || result.score > best.score) {
              best = result;
            }
          }
        }
      }
    }
  }
  return best;
}
