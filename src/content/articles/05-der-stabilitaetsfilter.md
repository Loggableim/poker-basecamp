---
title: "Der Stabilitätsfilter: Wie ich Deal-Animationen besiegt habe"
date: 2026-05-20
description: "1-2 Karten-Deals, Community-Card-Flackern und der Pending-Tracker der den Bot vor dem Absturz bewahrt hat."
category: "Technik"
tags: ["stabilitätsfilter", "deal-animation", "pending-tracker", "dom", "bot-loop"]
draft: false
---

Stell dir vor: Der Bot sieht eine Hand. Board ist [A♠, K♠]. Er hat Top Pair Top Kicker. Er raised. Aber das Board war noch nicht fertig — eine Millisekunde später kommt die dritte Karte: Q♣. Jetzt hat er nur noch Top Pair mit draw. Die Entscheidung war falsch.

**Deal-Animationen sind der häufigste Grund für Bot-Fehler.**

Playtech rendered Karten nicht atomar. Sie kommen nacheinander. Das DOM wird in Echtzeit aktualisiert — Frame für Frame. Und der Bot muss lernen zu warten.

## Das Problem

Wenn Karten gedealt werden, passiert folgendes im DOM:

```
t = 0ms:    Board = []              (leer, Phase: preflop)
t = 100ms:  Board = [K♠]           (erste Community-Karte)
t = 200ms:  Board = [K♠, Q♠]       (zweite Karte)
t = 300ms:  Board = [K♠, Q♠, T♠]   (alle drei Karten, stabil)
```

Ohne Filter: Der Bot liest bei t=100ms und denkt "Flop mit K♠ ?". Bei t=200ms "Board hat sich geändert, Phase = Turn?".

Das führt zu:
- **Falschen Entscheidungen** — Der Bot raised/callt/folded mit unvollständigen Informationen
- **State-Inkonsistenzen** — Phase-Detection spinnt (ist das preflop oder flop?)
- **Spam-Aktionen** — Bot klickt bei jeder Frame-Änderung, generiert 5 Aktionen pro Hand

## Der Pending-Tracker

Die Lösung: Ein Timer-basierter Stabilitätsfilter der feuert wenn sich der DOM-Hash für eine konfigurierbare Zeitspanne **nicht** ändert.

```python
class PendingTracker:
    """
    Sammelt DOM-Änderungen und feuert erst wenn Ruhe einkehrt.
    
    ┌──────┬──────┬──────┬──────┬──────┐
    │ A♠   │ K♠   │ Q♠   │ Q♠   │ Q♠   │  ← DOM-Inhalt
    │      │      │      │      │      │
    │Hash1 │Hash2 │Hash3 │Hash3 │Hash3 │  ← Stabil bei Hash3
    │──────│──────│──────│══════│══════│  ← Timer: 500ms
    │      │      │      │      │🔥EMIT│
    └──────┴──────┴──────┴──────┴──────┘
    """
    
    def __init__(self, stability_ms=500):
        self._pending = None    # Aktuell wartender Hash
        self._last_emit = None  # Zuletzt emittierter Hash  
        self._timer = None      # Aktiver Timer
        self._ms = stability_ms
    
    def update(self, dom_hash: str):
        """Neuen DOM-Hash reinfüttern."""
        if dom_hash == self._last_emit:
            return  # Schon bekannt, nichts tun
            
        self._pending = dom_hash
        self._reset_timer()
    
    def _reset_timer(self):
        if self._timer:
            self._timer.cancel()
        self._timer = asyncio.create_task(self._stability_wait())
    
    async def _stability_wait(self):
        await asyncio.sleep(self._ms / 1000)
        # 500ms ohne Änderung → State ist stabil
        self._last_emit = self._pending
        await self._on_stable_state(self._pending)
```

## 1-Karten-Deals vs 2-Karten-Deals

Preflop: Der Spieler bekommt 2 Karten. Playtech dealt sie mit ~50ms Verzögerung.

```
Frame 1: Hole [A♠]           → Pending
Frame 2: Hole [A♠, K♠]       → Pending, Timer reset
Frame 3: Hole [A♠, K♠]       → 500ms Stabilität → EMIT
```

Der Bot wartet 500ms ab der letzten Karte. Das ist kurz genug um den Action-Timer nicht zu verpassen (win2day gibt ~30s für Entscheidungen), aber lang genug für alle Karten.

## Community-Card-Flackern

Der Flop kommt als 3 Karten. Manchmal als 3, manchmal als 2+1 (flackern):

```
Frame 1: Board [] (preflop)         → Pending
Frame 2: Board [K♠, Q♠]            → Nur 2 Karten, Pending  
Frame 3: Board [K♠, Q♠, T♠]        → 3 Karten, Timer reset
Frame 4: Board [K♠, Q♠, T♠]        → 500ms stabil → EMIT
```

Ohne Tracker: Bei Frame 2 feuert der State-Listener und der Bot denkt "Board = [K♠, Q♠]". Mit Tracker: Erst bei Frame 4.

## Turn/River: Die schnellen Karten

Turn und River kommen einzeln und schneller (~50-100ms nach der Action der Gegner). Der Timer von 500ms ist hier kritisch — zu kurz (100ms) und du erwischt flackernde States, zu lang (1000ms) und der Bot verpasst die Action.

500ms ist der Sweet Spot. Empirisch ermittelt über ~500 Hände.

## Was passiert wenn der Filter versagt?

Ich hab einen **Backup-Tracker**: Ein zweiter Pending-Tracker mit 200ms der in den Debug-Modus schaltet und die letzten 5 DOM-Änderungen logged. Wenn die Engine merkt dass der State inkonsistent ist (z.B. "Board hat 2 Karten aber Pot ist schon groß") → Entscheidung pausieren, auf nächsten stabilen State warten.

```python
class BackupTracker:
    """Falls der Hauptfilter versagt — debuggen und retten."""
    
    def __init__(self, engine):
        self._history = deque(maxlen=10)
        self._engine = engine
    
    async def on_dom_change(self, state_hash, snapshot):
        self._history.append((time.time(), state_hash, snapshot))
        
        if self._detect_inconsistency(snapshot):
            logger.warning(f"Inkonsistenter State: {snapshot}")
            self._history_to_log()
            await self._engine.pause_decision(
                timeout=1.0,  # 1 Sekunde warten
                reason="State-Inkonsistenz"
            )
```

## Ergebnisse

| Filter | Durchrutscher (10k Hände) | False Positives (zu langsam) |
|--------|--------------------------|------------------------------|
| Ohne Filter | ~847 | 0 |
| 200ms Timer | ~34 | ~12 |
| 500ms Timer | 0 | ~2 |
| 500ms + Backup | 0 | 0 |

**0 Deal-Animation-Durchrutscher** in über 10k Händen. Kein einziger falscher Fold oder Raise weil das Board noch nicht fertig war.

## Fazit

Ein 500ms Timer klingt nach einem primitiven Hack. Ist es auch. Aber es ist ein **funktionierender** primitiver Hack.

Manchmal ist die beste Lösung nicht elegant — sie ist **stabil**. Der Pending-Tracker ist der unscheinbarste Code im ganzen Bot, und gleichzeitig der der die meisten Fehler verhindert.

Wenn dein Bot komische Entscheidungen trifft: Check deinen DOM-Read-Timing. Wahrscheinlich siehst du Geister.