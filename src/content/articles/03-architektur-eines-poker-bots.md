---
title: "Die Architektur eines Poker Bots — Datenfluss, Module, Design-Entscheidungen"
date: 2026-05-20
description: "Vom DOM-Reader zur Decision Engine: 6 Module, 11k Zeilen Code, und warum ein Poker Bot nicht einfach 'den Button klickt'."
category: "Architektur"
tags: ["architektur", "datenfluss", "design", "bot-loop", "dom-reader", "decision-engine"]
draft: false
---

Ein Poker Bot ist kein Skript. Es ist ein **komplexes Echtzeit-System** aus 6 Modulen, die in einer rückgekoppelten Schleife arbeiten.

Wenn Leute sagen "Du klickst doch nur auf Buttons" — die haben null Ahnung. Der Bot muss:
- Den DOM von 3 verschachtelten Iframes lesen
- SVG-Pfade in Spielkarten übersetzen
- Ökonomische Animationen von stabilem State unterscheiden
- Eine 3-stufige Entscheidungsmatrix durchlaufen
- Browser Aktionen ausführen ohne gebannt zu werden
- Das alles in <500ms pro Loop-Iteration

Hier ist die Architektur.

## Die 6 Module im Überblick

```
┌──────────────────────────────────────────────────────────────┐
│                        BOT CONTROLLER                        │
│     (Loop-Scheduler, Watchdog, Shared State Manager)         │
└──────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   DOM-Reader     │  │  Decision Engine │  │  BrowserActor    │
│  (Playwright)    │──▶  (3-stufig)      │──▶  (Chrome CDP)    │
│  → TableState    │  │  → Entscheidung  │  │  → Action        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  Hand Classifier │  │  Dashboard API   │
│  → Board Texture │  │  (FastAPI :8765) │
│  → SPR, Position │  │  → Live-Status   │
│  → Gegner-Profil │  │  → Multi-Table   │
└─────────────────┘  └─────────────────┘
```

### 1. Browser (Chrome CDP + Playwright)

Playwright steuert einen Chrome-Browser via Remote Debugging Protocol auf Port 9222. Der Bot öffnet win2day, loggt sich ein (Credentials über ENV-Vars, kein Hardcoding), navigiert zum Tisch.

**Warum Playwright und nicht Selenium?** Playwrights `page.evaluate()` erlaubt direkten JS-Zugriff auf den Shadow-DOM. Selenium braucht Umwege über `execute_script` mit seltsamen Workarounds.

```python
# CDP-Verbindung
browser = await playwright.chromium.connect_over_cdp("http://localhost:9222")
page = browser.contexts[0].pages[0]
```

### 2. DOM-Reader

Das Parsing-Teil. Der Bot extrahiert alle Spiel-Daten aus dem Playtech-Iframe. Das ist nicht trivial weil:

- **Playtech verwendet Shadow-DOM** — die Tisch-Elemente sind in einem `<div>` mit `#shadow-root` versteckt
- **Karten sind SVGs** — keine Text-Labels, sondern `<path d="...">`-Pfade. Der Bot matcht die SVG-Pfade gegen eine Library bekannter Karten-Signaturen
- **Zahlen sind transformiert** — der Pot wird per `translateY` animiert

Der DOM-Reader returned ein strukturiertes Objekt:

```python
@dataclass
class TableState:
    phase: str          # 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
    hero_hand: list[Card]
    board: list[Card]
    pot: float
    stacks: dict[str, float]  # player_name → stack
    actions: list[ActionHistory]
    is_hero_turn: bool
    buttons: ButtonState       # welche Aktionen verfügbar
    hand_id: str               # eindeutig pro Hand
```

### 3. Hand Classifier

Bevor die Engine eine Entscheidung fällt, muss sie den aktuellen Spot verstehen:

- **Board Texture:** Paired, Coordinated, Wet, Dry, Monotone, Rainbow, Pat
- **SPR (Stack-to-Pot Ratio):** ≥6 deep, 4-6 medium, 2-4 low, 1-2 very low, <1 committed
- **Position:** IP / OOP (In Position vs Out of Position)
- **Gegner-Tendenz:** LAG / TAG / Passive / Maniac / Unknown (wird über ~20 Hände gemittelt)

```python
class HandClassifier:
    def classify(self, state: TableState) -> SpotClassification:
        return SpotClassification(
            board_texture=self._classify_board(state.board),
            spr_category=self._calculate_spr(state),
            position=self._determine_position(state),
            opponent_profile=self._get_opponent_profile(state),
        )
```

### 4. Decision Engine (3-stufig)

Das Herzstück. Die Engine entscheidet was der Bot tut. Drei Stufen, abhängig von der Situation:

```
                   ┌─────────────────────┐
                   │  Game State Input    │
                   └──────────┬──────────┘
                              ▼
                    ┌─────────────────┐
                    │ Stack-Tiefe    │
                    │ < 15bb?        │──Yes──▶ Push/Fold Nash
                    └────────┬────────┘         (Tabellen-basiert)
                             │ No
                             ▼
                    ┌─────────────────┐
                    │  Final Table /   │
                    │  Bubble?         │──Yes──▶ ICM (Exakt + MC)
                    └────────┬────────┘         ($EV Maximierung)
                             │ No
                             ▼
                    ┌────────────────────────────────────┐
                    │  Standard Engine                     │
                    │  MDF + Alpha + B/V-Ratio + Texture  │
                    │  Mixed Strategy via MD5-Seed        │
                    └────────────────────────────────────┘
```

**Stage 1 — Push/Fold Nash (3-40bb):**
Nash Equilibrium Tabellen für Push- und Call-Ranges. 3-20bb in 1bb-Schritten, 20-40bb in 2bb-Schritten. Jede Position (UTG, MP, CO, BTN, SB, BB).

**Stage 2 — ICM (Finals/Bubbles):**
Exakte ICM-Berechnung (≤5 Spieler) + Monte-Carlo für 6+ Spieler. Spin&Go (100/0) und MTT-Spot-Support.

**Stage 3 — Standard Engine:**
- MDF (Minimum Defense Frequency): "Wie viel muss ich verteidigen?"
- Alpha: "Wie oft muss ein Bluff funktionieren?"
- Bluff-to-Value-Ratio: Basierend auf Bet-Size und Board-Texture
- Mixed Strategy: MD5-Hash des Game-States entscheidet zwischen 2-3 Äquilibrien

### 5. BrowserActor

Die Entscheidung wird zu einer Aktion. Der BrowserActor:

1. Findet den richtigen Button im DOM (`div#FOLD.action-button` vs `input#FOLD.pre-action-toggle`)
2. Prüft ob der Button aktiv ist (nicht disabled)
3. Führt den Click aus (mit zufälliger Timing-Varianz ±150ms für Anti-Detection)
4. Wartet auf die nächste State-Änderung

**Wichtig:** `.action-fold` ist NICHT der Button. Der echte Button ist `div#FOLD.action-button` im Playtech-Shadow-DOM. Der `.action-fold` ist ein CSS-Selektor der 3 Layer höher hängt und nur die Hover-Animation triggert. Den Fehler hab ich 2 Tage gesucht.

### 6. Dashboard (FastAPI :8765)

Ein Live-Dashboard das parallel zum Bot läuft:

- **Multi-Table Layout Switcher** — GUI um zwischen Tischen zu wechseln
- **Live Stats** — VPIP, PFR, CBet, Winrate, Hands/Hour
- **Decision Log** — Jede Bot-Entscheidung mit Begründung
- **Health Check** — Thread-Status, Latenz, Fehlerrate

## Datenfluss im Loop

```
Jede ~200-300ms:

  1. DOM-Reader scannt Tisch-State
  2. Hash-Vergleich → State geändert? → Nein: warten
  3. State Parser: DOM-Rohdaten → TableState (strukturiert)
  4. Hand Classifier: TableState → Spot Classification
  5. Decision Engine: SpotClassification → Aktion
  6. BrowserActor: Aktion → Button-Click im Browser
  7. Zurück zu 1 (warten auf nächste State-Änderung)
```

**Warum keine kontinuierliche Schleife?** Weil der Bot sonst 50 Reads pro Sekunde macht, CPU killt und vom Chrome als Bot identifiziert wird. Die Schleife pausiert nach jedem Action-Trigger und wartet auf DOM-Änderungen via Playwrights `wait_for_function()`.

## Warum es nicht einfach "Button klicken" ist

Weil zwischen "Button im DOM finden" und "Button klicken" eine Kaskade von Problemen liegt:

- Ist der Button im active layer oder ghost state?
- Ist es meine Turn Action oder hat der Gegner noch nicht reagiert?
- Liegt die Pot-Anzeige richtig oder hängt sie in einer Animation?
- Sind die Board-Karten stabil oder flackern sie noch?
- Hab ich hier überhaupt Equity zu callen?

Der Bot muss Poker verstehen, nicht nur Buttons finden.

## Aktueller Stand

| Metrik | Wert |
|--------|------|
| Code-Zeilen | ~11.000 |
| Tests | 251 |
| Module | 6 Hauptmodule |
| Loop-Zeit | ~200-400ms |
| Stabilität | 500+ Hände ohne Crash |

Im nächsten Artikel: Wie der DOM-Reader mit Playtech-Iframes kämpft — und warum SVGs meine Existenz hassen.