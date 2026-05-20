---
title: "Warum ich einen Poker Bot gebaut habe"
date: 2026-05-20
description: "Origin Story: Wie aus einer Late-Night-Idee ein 11.000-Zeilen-Projekt wurde. Und warum Poker+Code das perfekte Paar sind."
category: "Tagebuch"
tags: ["origin", "motivation", "deepseek-pro", "dev-story"]
draft: false
---

Es war 2:47 Uhr an einem Dienstag. Zwei Bier drin, eine Runde NL10 auf win2day, und ich realisiere: **Ich spiele denselben Scheiß wie vor drei Jahren.**

Keine Verbesserung. Keine Strategie. Nur Hope-Poker — callen weil's mich interessiert was er hat, raisen weil ich zu tilted bin zu folden. Der Graph meines Kontos sah aus wie ein EKG im Flatline-Modus.

Also hab ich was getan, was jeder normale Mensch tun würde: Ich hab beschlossen, mir jemanden zu bauen, der's besser kann.

### Der erste Button-Klick

Die naive Idee: Python-Skript, Screenshots, OCR, Karten lesen, Raise-Button klicken. Easy.

Nach drei Wochen hatte ich einen Haufen Screenshots, null funktionierende OCR, und ein Skript das immer dann abstürzte wenn der Pot interessant wurde.

Der erste Moment wo's Klick gemacht hat war nicht als der Bot eine Hand gewonnen hat. Es war als er den **Fold-Button gefunden hat** — via DOM-Query, nicht via pixel hunting.

```python
# Der Moment wo's real wurde
fold_button = page.locator('div#FOLD.action-button')
if await fold_button.is_visible():
    await fold_button.click()
```

Drei Zeilen Code. Aber dahinter steckt: Playwright, Chrome CDP, Iframe-Navigation durch 3 Ebenen, Shadow-DOM-Parsing, ein State-Tracker der weiß ob wir dran sind, und ein Stabilitätsfilter der nicht auf halbe Deal-Animationen reinfällt.

Dieser erste erfolgreiche Fold auf 72o — das war der Moment. Nicht der Gewinn. Der **richtige Fold**.

### Warum Poker + Programmieren das perfekte Paar ist

Ich bin kein Poker-Pro. Aber ich bin ein guter Programmierer. Und das ist der Punkt: **Poker ist das ideale Spielfeld für Entwickler.**

1. **Begrenzter State** — 52 Karten, 6 Spieler, endliche Aktionen. Das ist kein Autonomous Driving, es ist ein endlicher Automat mit Rauschen.
2. **Mathematisch fassbar** — Equity, Pot Odds, MDF, ICM, Nash. Alles berechenbar. Kein "Gefühl", nur Zahlen.
3. **Echtzeit-Feedback** — Jede Entscheidung zeigt sofort ob sie richtig war. Das ist wie Unit Tests fürs Ego.
4. **Unendliche Tiefe** — GTO ist nicht "gelöst". Es gibt immer eine bessere Approximation, einen schrägeren Spot, eine neue Mixed Strategy.

Und was mich wirklich antreibt: **Der Bot zwingt mich, Poker von Grund auf zu verstehen.** Nicht als Bauchgefühl, sondern als berechenbares System. Jede Entscheidung muss ich in Code übersetzen können. Und Code lügt nicht.

### Warum ich das öffentlich mache

Weil ich selbst keinen Bock auf diese "Secret System"-Scheiße habe. Ich will sehen wie andere das machen, und andere sollen sehen wie ich es mache.

Poker Basecamp ist mein Dev-Tagebuch. Kein Marketing. Kein "kauf meinen Kurs". Nur: hier ist der Code, hier sind die Bugs, hier sind die Ergebnisse.

Die Site heißt Poker Basecamp, Brand ist DeepSeek Pro. Das Design? Nenn es "Washed Warhol" — pastell-düster, Hunter S. Thompson Vibe, weil Poker für mich Kunst und Mathematik in einem ist.

### Was jetzt kommt

In den nächsten Wochen dokumentiere ich hier den kompletten Bau. Von der ersten Zeile Playwright-Code bis zur 3-stufigen Decision Engine mit CFR Spot Library.

Aktueller Stand: ~11.000 Zeilen Code, 251 Tests, 30+ gefixten Bugs, und ein Bot der NL50 spielt ohne zu crashen.

Und ja — er gewinnt manchmal. Aber wichtiger: **er foldet wenn er soll.**

Das ist mehr als ich von mir sagen kann.