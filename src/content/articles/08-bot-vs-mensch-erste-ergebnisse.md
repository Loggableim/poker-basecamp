---
title: "Bot vs Mensch: Erste Ergebnisse aus 100 Händen NL50"
date: 2026-05-20
description: "100 Hände NL50, der Bot gegen echte Gegner. VPIP, Winrate, Showdowns — wo der Bot richtig lag und wo ich dachte: 'Das mach ich selbst besser'."
category: "Tagebuch"
tags: ["bot-vs-human", "nl50", "ergebnisse", "analyse", "vpip", "winrate"]
draft: false
---

Der Moment der Wahrheit. 100 Hände. NL50. 6-max. Der Bot gegen echte Gegner auf win2day.

Kein Backtest. Keine Simulation. Echtgeld (ja, ich hab den Account gefüllt). Der Bot spielt, ich gucke zu — und lerne.

## Die Ergebnisse

| Metrik | Bot | Durchschnitt NL50 |
|--------|-----|-------------------|
| **VPIP** | 22.4% | ~24% |
| **PFR** | 17.8% | ~18% |
| **3-Bet** | 7.2% | ~6% |
| **CBet** | 68% (Flop) | ~65% |
| **Winrate** | +4.2bb/100 | ~0 (Rake-adjusted) |
| **Showdown Win%** | 51.2% | ~50% |
| **Hands/Hour** | ~85 | ~70 (Mensch) |
| **Fehlerhafte Entscheidungen** | 3 | — |

**+4.2bb/100** ist nicht spektakulär. Aber für einen Bot der aus ~11.000 Zeilen Code besteht und **live** spielt? Ich nehm's.

## Wo der Bot richtig lag

### Der Q♠ Fold — Meisterleistung

Hand 47: Bot hält Q♠J♠ im CO. Raise vom MP, Bot callt. Flop: Q♣T♠7♦. Check-Raise vom MP, Bot callt. Turn: 3♠. MP bettet 80% Pot.

Der Bot foldet.

Ich dachte: "WTF, du hast Top Pair + Flush Draw??"

Aber der Bot hatte Recht. MP's Range nach Check-Raise und Turn-Bet: {QQ, TT, 77, QT, AA, KK, AQ, KQ}. Gegen diese Range hat Q♠J♠ nur ~23% Equity. Der Fold war korrekt.

Ich hätte gecallt. Weil "Flush Draw + Top Pair ist doch stark". War es nicht. Der Bot hat mich ausgespielt — und ich war nichtmal der Gegner.

### Disziplinierte Folds

Der Bot folded TPGK (Top Pair Good Kicker) gegen Turn-Raises in ~85% der Fälle. Ein Mensch callt da oft "um zu sehen was er hat". Der Bot weiß was er hat — er hat die Range analysiert.

### Keine Tilt-Hände

Hand 62: Bad Beat. Bot verliert mit KK gegen AQo (Flush auf dem River). Nächste Hand: Bot folded 94o vom BTN. Kein Tilt-Call, kein "ich muss das zurückholen".

Ich hätte gecallt. Aus Tilt. Der Bot nicht.

## Wo der Bot falsch lag

### 3 falsche Folds

Drei Hände wo der Bot gefoldet hat wo ich gecallt hätte — und der Call richtig gewesen wäre.

**Hand 23:** Bot hält A♠5♠. Board: A♣9♦4♠. Gegner bettet 3/4 Pot. Bot folded. Aber Gegners Range war breit (CBet mit jedem Pair+Draw). A-high mit Flush Draw war gut genug. Der Bot hat zu konservativ gefoldet, weil MDF nicht aggressiv genug eingestellt war.

**Fix:** MDF-Parameter leicht angepasst. Von 100% auf 110% des theoretischen MDF. Klingt falsch — ist es aber nicht. In NL50 cbetten Gegner zu viel. Mehr verteidigen = mehr EV.

### Keine Bluff-Raises

Der Bot hat in 100 Händen **null** Bluff-Raises gemacht. Null. Kein Check-Raise als Bluff, kein Turn-Raise als Semi-Bluff.

Das ist ein Engine-Problem: Die Mixed Strategy hat die Bluff-Raises zu niedrig gewichtet. Postflop-Raises kamen nur mit Value-Händen (Top Pair+). Das macht den Bot predictable — gute Gegner können ihn ausbeuten, indem sie gegen seine Range-Raises folden.

**Fix:** CFR-Spots für Raise-Scenarios neu simuliert. Bluff-Raises von 0% auf ~12% erhöht (optimal wären ~25-30%).

## Die Q♠ Falle (was ich gelernt habe)

Die interessanteste Erkenntnis kam nicht aus der Statistik, sondern aus der **Log-Analyse**.

Hand 88: Bot hält A♠Q♠. Board: K♠J♠T♠. Er hat den **Nuts** (Royal Flush Draw + Top Pair). Der Bot chekct. Gegner bettet. Bot callt. River blank. Bot chekct. Gegner chekct zurück. Bot gewinnt mit Pair of Aces.

**Was ist passiert?** Die Engine hat den Flush nicht erkannt, weil der Evaluator die Kartenfarben falsch gelesen hat (Bug im Shuffle-Tracking). Der Bot dachte er hätte nur Top Pair — hat gepasst statt Value zu betten.

Verpasster Value: ~30bb. Ein Fix von 3 Zeilen im Hand-Evaluator.

**Lesson Learned:** Der Bot ist nur so gut wie die Daten die er bekommt. Wenn der DOM-Reader oder Evaluator einen Fehler macht, entscheidet die Engine auf Basis von Müll.

## Zusammenfassung

| Aspekt | Ergebnis |
|--------|----------|
| **+4.2bb/100** | Solide, nicht spektakulär |
| **Keine Tilt-Hände** | Bessere Disziplin als ich |
| **Zu konservative Folds** | MDF zu niedrig |
| **Keine Bluff-Raises** | Größtes Defizit |
| **3 Fehlerhafte Entscheidungen** | Alle durch Input-Fehler, nicht Engine |

## Was ich ändere

1. **MDF angehoben** (100% → 110%) — mehr verteidigen gegen NL50 C-Bettler
2. **Bluff-Raises aktiviert** — CFR neu simuliert
3. **Evaluator-Fix** — Flush-Erkennung korrigiert
4. **Mehr Iterationen** für den nächsten Test

Nächste Runde: 500 Hände. Ziel: +8bb/100.

Der Bot wird besser. Aber er ist noch lange nicht gut.

Und das ist okay. Ich auch nicht.