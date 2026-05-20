---
date: 2026-05-13
title: "Die Architektur eines Poker Bots — Überblick"
description: "Vom DOM-Reader zur Decision Engine: Ein Überblick über alle Module, Datenflüsse und warum der Bot nicht einfach den Button klickt."
category: Technik
tags:
  - architektur
  - overview
draft: false
image: 🔧
---

Ein Poker Bot ist kein Skript, das "irgendwie den Button klickt". Es ist ein **komplexes System aus 6 Modulen**, die in einer genau definierten Kette zusammenarbeiten.

## Die 6 Module

```
Browser ← DOM-Reader ← State Parser ← Decision Engine → BrowserActor
                                        ↑
                                    Hand Classifier
```

### 1. Browser (Chrome CDP)
Playwright steuert einen Chrome-Browser mit Remote Debugging. Der Bot öffnet win2day, loggt sich ein und wartet auf den Tisch.

### 2. DOM-Reader
Der DOM-Reader extrahiert alle relevanten Daten aus dem Playtech-Iframe:
- Spieler-Positionen und Stacks
- Gemeinschaftskarten (Board)
- Eigene Hole Cards
- Pot-Größe
- Actions (Call, Raise, Fold Buttons)
- Gegnerische Actions (via Chat/History)

**Besonderheit:** Playtech verwendet Shadow-DOMs und SVGs statt HTML-Text — das macht das Parsen aufwändig.

### 3. State Parser
Die rohen DOM-Daten werden in einen strukturierten Game-State übersetzt:
```typescript
interface GameState {
  phase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  heroHand: Card[];
  board: Card[];
  pot: number;
  stacks: Map<Player, number>;
  actions: Action[];
  isHeroTurn: boolean;
}
```

### 4. Hand Classifier
Bevor die Engine entscheidet, klassifiziert der Hand Classifier die aktuelle Situation:
- **Board Texture:** 7 Kategorien (Paired, Coordinated, Dry, etc.)
- **SPR (Stack-to-Pot Ratio):** 5 Tiers
- **Position:** In Position / Out of Position
- **Gegner-Tendenz:** LAG / TAG / Passive / Unknown

### 5. Decision Engine (3-stufig)
Das Herzstück — mehr dazu im nächsten Deep Dive. Grob:
- **Stage 1:** Push/Fold Nash (≤15bb)
- **Stage 2:** ICM (final tables / bubbles)
- **Stage 3:** Standard (MDF + Mixed Strategy)

### 6. BrowserActor
Die Entscheidung wird in Aktionen übersetzt: Button-Koordinaten berechnen, klicken, warten.

## Datenfluss

```
Jede ~200ms:
DOM-Reader → State Parser → Hand Classifier → Decision Engine
                                                   ↓
                                            BrowserActor → Browser
                                                   ↓
                                            State Parser ← DOM-Reader
```

Der Bot läuft in einem **kontinuierlichen Loop** — lesen, analysieren, entscheiden, handeln — bis der Tisch geschlossen wird.

Im nächsten Artikel: Der DOM-Reader im Detail und warum Playtech-Iframes die Hölle sind.
