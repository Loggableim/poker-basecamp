---
title: "Equity Calculator Launch — Monte Carlo vs Enumeration, warum 10k Iterationen reichen"
date: 2026-05-20
description: "Unser erster GTO-Rechner geht live. Monte-Carlo-Simulation, Hand vs Range, und warum 10.000 Iterationen für 99% Genauigkeit reichen."
category: "Tutorials"
tags: ["equity", "monte-carlo", "tool-launch", "calculator", "simulation"]
draft: false
---

Der Equity Calculator ist live. [pokerbasecamp.com/tools/equity-calc](https://pokerbasecamp.com/tools/equity-calc)

Grund: Ich hatte keine Lust mehr, für jede Hand PioSolver oder Equilab zu öffnen. Plus — ich wollte die Engine die der Bot intern nutzt auch für euch zugänglich machen.

## Was der Rechner kann

- **Hand vs Hand:** A♠K♠ vs T♥T♣ → Wer hat wie viel Equity?
- **Hand vs Range:** A♠K♠ vs {TT+, AQ+, KQs} → Gegen eine ganze Range
- **Hand vs Range vs Board:** Auf K♠T♠5♦ — wie viel Equity hat dein Draw?
- **Range vs Range:** UTG vs BTN — wer dominiert wen?

Alles läuft **client-seitig** in Vanilla JS + WebWorker. Kein Backend nötig, kein API-Call, keine Ladezeiten.

## Monte Carlo vs Enumeration

Es gibt zwei Wege Equity zu berechnen:

**Enumeration (exakt):**
```python
def enumerate_equity(hand, opponent_range, board):
    """Jede mögliche Kombination durchspielen."""
    wins = ties = total = 0
    deck = Deck() - hand - board
    for opp_hand in opponent_range:
        for remaining in itertools.combinations(deck, 5 - len(board)):
            total += 1
            result = evaluate(hand + board + list(remaining),
                              opp_hand + board + list(remaining))
            if result[0] > result[1]: wins += 1
            elif result[0] == result[1]: ties += 1
    return wins / total, ties / total
```

**Problem:** Enumeration explodiert.
- Preflop: C(50,5) × C(45,2) = **2.118.760.000** Kombinationen
- Flop: C(45,2) × C(43,2) = **893.025** Kombinationen
- Turn: C(44,2) × 42 = **39.732** Kombinationen

Preflop-Enumeration ist praktisch unmöglich in Echtzeit.

**Monte Carlo (approximativ):**
```python
def mc_equity(hand, opponent_range, board, iterations=10_000):
    """Zufällige Stichproben statt vollständiger Enumeration."""
    wins = ties = 0
    deck = Deck() - hand - board
    for _ in range(iterations):
        # Ziehe zufällige Gegner-Hand aus Range
        opp_hand = random.choice(opponent_range)
        # Ziehe zufällige Board-Ergänzung
        remaining = random.sample(deck - opp_hand, 5 - len(board))
        
        result = evaluate(hand + board + remaining,
                          opp_hand + board + remaining)
        if result[0] > result[1]: wins += 1
        elif result[0] == result[1]: ties += 1
    
    return wins / iterations, ties / iterations
```

## Warum 10k Iterationen reichen

Die Equity-Schätzung folgt einer **Binomialverteilung**. Der Standardfehler ist:

```
SE = sqrt(p * (1-p) / n)

Mit p ≈ 0.5 (worst case, 50% Equity):
n = 1.000:  SE = 1.58% → 95% Konfidenzintervall: ±3.1%
n = 10.000: SE = 0.50% → 95% KI: ±0.98%
n = 100.000: SE = 0.16% → 95% KI: ±0.31%
```

10.000 Iterationen geben dir ±1% Genauigkeit. Für Poker-Entscheidungen reicht das. Der Unterschied zwischen 47% und 48% Equity ist selten entscheidend.

**Performance:** 10k Iterationen in JS (WebWorker) = ~150ms. 100k = ~1.5s. 1M = ~15s. Der Trade-off ist klar.

| Iterationen | Genauigkeit (±) | Zeit (JS) | Empfehlung |
|-------------|-----------------|-----------|------------|
| 1.000 | ±3.1% | ~15ms | Schnellcheck |
| **10.000** | **±1.0%** | **~150ms** | **Standard** |
| 100.000 | ±0.3% | ~1.5s | Analyse |
| 1.000.000 | ±0.1% | ~15s | Forschung |

**Ich nutze intern:** 10.000 für In-Game-Entscheidungen, 100.000 für Post-Session-Analysen.

## Under the Hood: Der Hand-Evaluator

Der Equity Calculator nutzt denselben Evaluator wie der Bot — eine 7-Karten-Bewertung via bit-encoding:

```python
class CardEvaluator:
    """
    7-card hand evaluator using prime-number encoding.
    ~50x faster than naive comparison.
    """
    PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]
    
    def evaluate(self, cards: list[int]) -> int:
        """
        Gibt einen eindeutigen Wert zurück (höher = besser).
        Encoding: Jede Karte ist ein int (0-51).
        """
        ranks = [c // 4 for c in cards]
        suits = [c % 4 for c in cards]
        return self._rank_hand(ranks, suits)
```

Der Evaluator unterstützt: High Card, Pair, Two Pair, Trips, Straight, Flush, Full House, Quads, Straight Flush, Royal Flush — in ~50µs pro Auswertung.

## Nächste Schritte

Der Equity Calculator ist Version 1.0. Was kommt:

- **Range vs Range Matrix** — Visualisiert als Heatmap
- **Equity Distribution** — Nicht nur Durchschnitt, sondern die Verteilung
- **Export** — Ergebnisse als PNG oder CSV
- **Bot Link** — "Was hätte der Bot gemacht?" direkt aus dem Calculator

Testet ihn: [pokerbasecamp.com/tools/equity-calc](https://pokerbasecamp.com/tools/equity-calc)

Feedback? hello@pokerbasecamp.com