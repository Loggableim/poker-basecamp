---
title: "Range-Thinking: UTG vs BTN — Warum Position alles ist"
date: 2026-05-20
description: "Der 13×13 Grid, Early-Position- vs Late-Position-Ranges, und warum UTG mit T♠9♠ foldet während BTN damit raise."
category: "Academy"
tags: ["range", "position", "utg", "btn", "13x13-grid", "range-construction"]
draft: false
---

Der häufigste Amateur-Fehler: **Jede Hand von jeder Position gleich spielen.**

T♠9♠ vom UTG? Fold. Vom BTN nach 3 Limpern? Raise. Gleiche Hand, völlig andere Entscheidung.

Range-Konstruktion ist die Grundlage aller GTO-Strategie. Hier ist warum — und wie es funktioniert.

## Der 13×13 Grid

Jede Poker-Hand passt in eine 13×13 Matrix:

```
     A  K  Q  J  T  9  8  7  6  5  4  3  2
   ┌────────────────────────────────────────┐
A  │ AA AK AQ AJ AT A9 A8 A7 A6 A5 A4 A3 A2│
K  │ KA KK KQ KJ KT K9 K8 K7 K6 K5 K4 K3 K2│
Q  │ QA QK QQ QJ QT Q9 Q8 Q7 Q6 Q5 Q4 Q3 Q2│
J  │ JA JK JQ JJ JT J9 J8 J7 J6 J5 J4 J3 J2│
T  │ TA TK TQ TJ TT T9 T8 T7 T6 T5 T4 T3 T2│
9  │ 9A 9K 9Q 9J 9T 99 98 97 96 95 94 93 92│
8  │ 8A 8K 8Q 8J 8T 89 88 87 86 85 84 83 82│
7  │ 7A 7K 7Q 7J 7T 79 78 77 76 75 74 73 72│
6  │ 6A 6K 6Q 6J 6T 69 68 67 66 65 64 63 62│
5  │ 5A 5K 5Q 5J 5T 59 58 57 56 55 54 53 52│
4  │ 4A 4K 4Q 4J 4T 49 48 47 46 45 44 43 42│
3  │ 3A 3K 3Q 3J 3T 39 38 37 36 35 34 33 32│
2  │ 2A 2K 2Q 2J 2T 29 28 27 26 25 24 23 22│
   └────────────────────────────────────────┘
```

Diagonal = Pairs (AA, KK, QQ...). Oberhalb = Suited. Unterhalb = Offsuit.

Jede Zelle repräsentiert eine Hand (oder 4 bei offsuit, 1 bei Pairs, 1 bei suited). Die 169 möglichen Kombinationen.

## UTG vs BTN — Zwei völlig verschiedene Welten

### UTG (Under The Gun) — Early Position

UTG spricht als **erster** nach dem Dealen. Es sind noch 5-6 Spieler hinter dir die agieren können. Du hast keine Information. Deine Range muss **tight** sein.

```
UTG Open-Raise Range (GTO ~12-15%):
     A  K  Q  J  T  9  8  7  6  5  4  3  2
   ┌────────────────────────────────────────┐
A  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██    │
K  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██    ██│
Q  │ ██ ██ ██ ██ ██ ██ ██ ██ ██          │
J  │ ██ ██ ██ ██ ██ ██ ██ ██              │
T  │ ██ ██ ██ ██ ██ ██ ██                  │
9  │ ██ ██ ██ ██ ██ ██                      │
8  │ ██ ██ ██ ██ ██                          │
7  │ ██ ██ ██ ██                              │
6  │ ██ ██ ██                                  │
5  │ ██ ██                                      │
4  │ ██                                          │
3  │                                              │
2  │ ██                                          │
   └────────────────────────────────────────┘
```

**UTG Raiser:**
- Nur die Top 12-15% der Hände
- Pairs: 77+ (manchmal 66, aber weich)
- Suited Broadways: AQs+, KQs+, QJs, JTs
- Offsuit: AKo, AQo (AJs manchmal)
- Suited Aces: ATs+, A9s (manchmal)
- Keine Suited Connectors unter JT

**Warum so eng?** Nach dem Raise sind 5 Spieler dran. Jeder kann 3-betten. Du willst Hände die gegen 3-Bets bestehen können, oder zumindest gut genug sind um zu callen.

### BTN (Button) — Late Position

BTN ist die **beste Position** am Tisch. Du siehst was alle vor dir machen. Nach deiner Action kommen nur noch SB und BB — und die sind out of position.

```
BTN Open-Raise Range (GTO ~40-50%):
     A  K  Q  J  T  9  8  7  6  5  4  3  2
   ┌────────────────────────────────────────┐
A  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██│
K  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██│
Q  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██│
J  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██│
T  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██│
9  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██   │
8  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██      │
7  │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██          │
6  │ ██ ██ ██ ██ ██ ██ ██ ██                │
5  │ ██ ██ ██ ██ ██ ██ ██                    │
4  │ ██ ██ ██ ██ ██ ██                        │
3  │ ██ ██ ██ ██ ██                            │
2  │ ██ ██ ██ ██                              │
   └────────────────────────────────────────┘
```

**BTN Raiser:**
- 40-50% aller Hände
- Alle Pairs (22+)
- Alle Suited Aces
- Alle Suited Broadways
- Alle Suited Connectors (54s+)
- Alle Offsuit Broadways
- Suited 1-Gappers (97s, 86s, 75s, 64s...)
- Manche Offsuit (K9o, Q9o, J9o, T8o)
- Manche Suited Weak (A2s-A5s sind pure Blocker-Raise)

**Warum so weit?** Zwei Spieler hinter dir. SB und BB haben enge 3-Bet-Ranges (weil sie Position aufgeben). Du kannst profitabel mit 54s raisen weil du Position hast — und wenn SB/BB flatcalled, dominierst du sie postflop.

## Die Range-Lücke

Der Unterschied zwischen UTG (~13%) und BTN (~45%) ist **32 Prozentpunkte**. Das ist die "Range-Lücke" — der Wert der Position in bb.

```
Position →  UTG    MP    CO    BTN    SB    BB
Range %     13    17     25     45     45    variabel
           (tight)                   (wide)
```

Jede Position weiter rechts öffnet die Range um ~5-10%. Weil du mehr Information hast und weniger Gegner hinter dir.

## Wie ich Ranges im Bot implementiere

Der Bot nutzt vordefinierte Ranges als Basis, die pro Position und Stack-Tiefe angepasst werden:

```python
class RangeBuilder:
    """Baut und verwaltet Poker Ranges."""
    
    def __init__(self):
        self._ranges = self._load_default_ranges()
    
    def _load_default_ranges(self):
        return {
            'UTG':   Range("77+, ATs+, KQs, AJo+, KQo"),
            'MP':    Range("55+, A9s+, KTs+, QTs+, JTs, ATo+, KQo"),
            'CO':    Range("22+, A2s+, K9s+, Q9s+, J9s+, T9s+, 98s, "
                           "ATo+, KTo+, QTo+, JTo"),
            'BTN':   Range("22+, A2s+, K2s+, Q2s+, J2s+, T5s+, 95s+, "
                           "85s+, 75s+, 65s+, A2o+, K7o+, Q7o+, J7o+, "
                           "T7o+, 97o+, 87o+"),
            'SB':    Range("22+, A2s+, K2s+, Q6s+, J7s+, T7s+, 97s+, "
                           "86s+, 75s+, 65s+, A2o+, K7o+, Q8o+, J8o+, "
                           "T8o+, 98o+"),
        }
    
    def get_range(self, position: str, 
                  stack_bb: float = 100,
                  opponent_3bet: float = 0.08) -> Range:
        """Holt Range mit dynamischen Anpassungen."""
        base_range = self._ranges[position]
        
        # Anpassungen
        if stack_bb < 15:
            base_range = self._to_push_fold(base_range)
        if opponent_3bet > 0.10:
            base_range = self._tighten_against_3bet(base_range)
        if opponent_3bet < 0.05:
            base_range = self._widen_against_passive(base_range)
        
        return base_range
```

## Custom Range Builder (unser Tool)

Im Range Visualizer auf Poker Basecamp kannst du Ranges visuell bauen:

1. **13×13 Grid** anklicken — jede Zelle ist eine Hand
2. **Vordefinierte Ranges** laden (UTG, MP, CO, BTN, SB, BB)
3. **Heatmap** — Farbe zeigt Stärke/Frequenz
4. **Permalink** — deine Range teilen per URL

Praktisch: Du kannst eine Range bauen, die Bot-Engine fragen "Was würdest du hier spielen?", und vergleichen.

## Praxis-Tipp: Range vs Range

Nicht deine Hand ist entscheidend. Es ist deine Range gegen seine Range.

BTN raised. BB callt. Board: K♠7♣2♦.

- **BTN's Range:** 45% der Hände (viele Broadways, viele Suited)
- **BB's Range:** Call-Range (~25% der Hände, viele Pairs, suited connectors)

BTN hat eine **Range-Advantage** — mehr KX Hände, mehr starke Karten. BB hat mehr Pairs und Draws.

Konsequenz: BTN sollte auf K-High Boards **aggressiv** c-betten (~70-80%). BB sollte viel check-callen aber wenig check-raisen (weil BTN zu viele KX hat).

Das ist Range-Thinking. Nicht "ich hab Top Pair also bette ich". Sondern "meine Range ist stärker als seine, also bette ich als Range".

## Fazit

Range-Konstruktion ist die Basis aller GTO-Strategie. Ohne verstandene Ranges spielst du blind — jede Entscheidung ist ein Guess.

Mit Ranges: Jede Entscheidung ist eine Gleichung. EV, Equity, Polarität, Position.

**Merksatz:** Deine Range ist deine Persönlichkeit am Tisch. Ein UTG der 45% raist ist ein Maniac. Ein BTN der 13% raist ist ein Nit. Beide sind ausbeutbar.

Der Bot spielt per Position die richtige Range. Und das ist der Grund warum er gewinnt — nicht weil er Glück hat, sondern weil er statistisch korrekt handelt.