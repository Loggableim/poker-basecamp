---
date: 2026-05-15
title: "Warum ich einen Poker Bot gebaut habe"
description: "Origin Story: Wie aus einer Late-Night-Idee ein 3000-Zeilen-Projekt wurde."
category: Tagebuch
tags:
  - origin
  - motivation
draft: false
image: 💻
---

Es begann an einem Dienstagabend. Zwei Bier tief, eine Runde NL10 auf win2day, und die frustrierende Erkenntnis: **Ich spiele genau so wie vor drei Jahren.** Keine Verbesserung, keine Strategie, nur Hope-Poker.

Also beschloss ich: Wenn ich nicht besser werde, bau ich mir jemanden, der es kann.

### Die ersten Schritte

Die erste Idee war naiv: Ein Python-Skript, das Screenshots macht und per OCR die Karten liest. Funktioniert hat es nicht. Aber es hat etwas in mir entzündet.

Nach drei Wochen hatte ich:
- Einen DOM-Reader, der Playtech-Iframes parst
- Eine rudimentäre Decision Engine mit statischen Regeln
- Und 47 Bugs, die ich **nicht** gefixt hatte

### Warum Poker + Code?

Poker ist das perfekte Spielfeld für Entwickler:

1. **Begrenzter State** — 52 Karten, 6 Spieler, endliche Aktionen
2. **Mathematisch fassbar** — Equity, Odds, MDF, ICM
3. **Echtzeit-Feedback** — Du siehst sofort, ob die Entscheidung richtig war
4. **Unendliche Tiefe** — Selbst GTO ist nicht "gelöst"

Und genau das macht den Reiz aus: Einen Bot zu bauen heißt, Poker von Grund auf zu verstehen. Nicht als Bauchgefühl, sondern als berechenbares System.

### Was jetzt kommt

In den nächsten Wochen dokumentiere ich hier den kompletten Bau — von der ersten Zeile Playwright-Code bis zur 3-stufigen Decision Engine.

Stay tuned.
