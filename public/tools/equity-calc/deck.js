/**
 * deck.js — 52-Karten-Deck mit Fisher-Yates Shuffle und Zieh-Funktionen
 */
const SUITS = ['s', 'h', 'd', 'c'];
const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };
const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const RANK_VALUES = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,
                      'T':10,'J':11,'Q':12,'K':13,'A':14 };

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, id: rank + suit });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  // Fisher-Yates (durcheinandermischen)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawCards(deck, count) {
  return deck.splice(0, count);
}

function cardId(rank, suit) {
  return rank + suit;
}

export { SUITS, SUIT_SYMBOLS, RANKS, RANK_VALUES, createDeck, shuffleDeck, drawCards, cardId };
