---
title: "GTO verstehen (ohne Mathestudium) — Nash, Mixed Strategies und warum Perfektion nicht gewinnt"
date: 2026-05-20
description: "Nash-Equilibria, Mixed Strategies mit Schere-Stein-Papier, und warum GTO-Spiel nicht maximal profitabel ist — aber dich unausbeutbar macht."
category: "Academy"
tags: ["gto", "nash", "mixed-strategy", "equilibrium", "exploit", "theory"]
draft: false
---

GTO (Game Theory Optimal) klingt nach höherer Mathematik. Ist es auch — aber die Konzepte dahinter sind einfach.

Und nein: GTO zu spielen heißt nicht "maximal gewinnen". Es heißt **nicht verlieren können**.

## Schere-Stein-Papier: GTO für Anfänger

Fangen wir mit dem einfachsten Spiel der Welt an. Schere-Stein-Papier.

**Das Nash Equilibrium:** 33% Schere, 33% Stein, 33% Papier. Zufällig, gleichverteilt.

Wenn du das spielst (perfekten Zufall vorausgesetzt), kann dein Gegner **nichts tun** um dich auszubeuten. Egal was er macht — über 1000 Runden wirst du weder gewinnen noch verlieren. Break-even.

**Aber:** Wenn du weißt dass dein Gegner zu 50% Stein spielt, ist GTO nicht optimal. Du spielst dann 100% Papier. Das ist **exploitativ** — du weichst vom Equilibrium ab um +EV zu generieren.

GTO = Schutz vor Verlust. Exploitativ = Maximierung gegen Fehler.

**Das Problem:** Wenn du exploitativ spielst und der Gegner passt sich an — bist du verwundbar. GTO ist der sichere Hafen.

## Nash Equilibrium in Poker

Poker ist unendlich komplexer als SSP. Aber das Prinzip ist dasselbe:

> Ein Nash Equilibrium ist ein Strategie-Set wo kein Spieler seine Strategie verbessern kann, solange die anderen ihre Strategie nicht ändern.

In Poker: Du hast eine optimale Range für jede Situation. Dein Gegner hat eine optimale Antwort. Wenn ihr beide eure Equilibria spielt — breakeven (abzüglich Rake).

**Konkretes Beispiel — BTN vs BB:**

Angenommen BTN raised zu 2.5bb. BB muss entscheiden: Fold, Call, oder 3-Bet.

Im Nash Equilibrium:
- BB foldet ~45% seiner Hände
- BB callt ~35%
- BB 3-bett ~20%

Wenn BB zu viel foldet (55%+), kann BTN jede Hand raisen und profitabel sein.
Wenn BB zu viel callt (45%+), wird BTN sein Value-Raising reduzieren und mehr Bluffs einbauen.
Wenn BB zu viel 3-bett (30%+), wird BTN sein Open-Raising-Range enger machen.

Das Equilibrium balanciert all das. Keine Seite kann ohne Nachteil abweichen.

## Mixed Strategies: Warum du nicht immer gleich spielen darfst

Die interessanteste Erkenntnis aus GTO: **Viele Hände werden nicht immer gleich gespielt.**

A♠K♠ auf K♠7♣2♦: Manchmal checkst du, manchmal bettest du. Beides ist im Equilibrium. Die Frequenz ist entscheidend.

```python
# Mixed Strategy: A♠K♠ auf K♠7♣2♦ (BTN vs BB)
# Im Equilibrium:
# - 65% C-Bet (Value)
# - 35% Check (Pot Control / Induktion)

def cbet_decision(hand: Hand, board: Board) -> bool:
    equity = calculate_equity(hand, board)
    if equity > 0.7:  # Starke Hände → Value Bet
        return True
    elif equity > 0.35:  # Mittlere Hände → Mixed
        seed = hash(f"{hand}:{board}")
        return (seed % 100) < 65  # 65% C-Bet
    else:  # Schwache Hände → Bluff oder Fold
        return (hash(f"{hand}:{board}_bluff") % 100) < 15
```

**Warum mixed?** Weil deterministisches Spiel ausbeutbar ist.

Wenn du immer Top Pair bettest, foldet dein Gegner sofort wenn du bettest — du gewinnst nichts. Wenn du niemals Top Pair bettest, raised er jede deiner Checks und du verlierst.

Mixed Strategy ist der Tanz dazwischen.

## Warum GTO nicht maximal profitabel ist

Das harte Real Talk: **GTO ist nicht der Weg zum maximalen Gewinn.**

In einem idealen Spiel (alle Spieler perfekt) ist GTO break-even (minus Rake). Profit kommt aus **Fehlern der Gegner**.

Ein GTO-Bot gewinnt ~0bb/100 gegen einen anderen GTO-Bot. Aber +5bb/100 gegen einen NL50-Durchschnittsspieler der zu viel callt und zu wenig blufft.

**Die optimale Strategie für maximale Profite:**

1. Spiele GTO als Basis
2. Detektiere Gegner-Fehler (zu loose, zu tight, zu passiv)
3. Weiche exploitativ ab
4. Wenn der Gegner sich anpasst: zurück zu GTO

```python
class ExploitEngine:
    def adjust_ranges(self, opponent_stats: OpponentStats):
        if opponent_stats.fold_to_cbet > 70:
            # Gegner foldet zu viel → mehr C-Bets
            self.cbet_frequency *= 1.2
            self.cbet_bluff_ratio *= 1.3
        
        if opponent_stats.call_too_wide > 40:
            # Gegner callt zu viel → engere Value, weniger Bluffs
            self.cbet_value_threshold += 0.05  # Nur stärkere Hände betten
            self.cbet_bluff_ratio *= 0.7
        
        if opponent_stats.aggression_factor < 1.0:
            # Gegner ist passiv → mehr Bluffs
            self.bluff_frequency *= 1.4
```

Der Bot spielt GTO als Default. Aber er passt sich an. Das ist der Sweet Spot.

## Equity vs EV: Der wichtige Unterschied

Nur weil du Equity hast, heißt das nicht dass du EV hast.

**Equity:** Deine Gewinnwahrscheinlichkeit (z.B. 35% den Pot zu gewinnen)
**Expected Value:** Dein durchschnittlicher Gewinn in €

```python
# Pot = 100, Gegner bettet 50
# Du hast 35% Equity

ev_call = (0.35 * 150) - (0.65 * 50)  # = 52.5 - 32.5 = 20
# EV = +20 → Call ist profitabel

# Aber: Wenn Gegner auf dem River immer foldet wenn der Draw kommt
# und immer bettet wenn nicht — sinkt dein EV
ev_call_adjusted = (0.35 * (150 * 0.3)) - (0.65 * 50)  # Gegner foldet nur 30%
# = 15.75 - 32.5 = -16.75
# → Fold ist besser als Call
```

GTO maximiert nicht deine Equity — es maximiert dein EV unter der Annahme dass der Gegner optimal reagiert.

## GTO Tools auf Poker Basecamp

Weil ich Mathe hasse (und liebe), hab ich Tools gebaut:

- **Equity Calculator** — Hand vs Range, Monte Carlo, live im Browser
- **Range Visualizer** — 13×13 Grid mit vordefinierten Ranges und Custom Builder
- **MDF Calculator** — "Wie viel muss ich verteidigen?" auf Knopfdruck
- **ICM Calculator** — Bubble Factor, $EV, für Spin&Gos und MTTs

Alle Tools sind Free. Weil GTO-Wissen keine Paywall verdient.

## Fazit

GTO ist die Basis. Nicht das Ziel.

Lern die Equilibria, spiel sie im Schlaf, und weich ab wenn der Gegner Fehler macht. Aber vergiss nie: GTO ist dein Sicherheitsnetz, nicht dein Gewinn-Versprechen.

> "GTO is how you don't lose. Exploitative is how you win." — irgendein smarter Grinder