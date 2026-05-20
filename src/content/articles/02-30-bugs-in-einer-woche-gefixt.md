---
title: "30 Bugs in einer Woche gefixt"
date: 2026-05-20
description: "Vier Akte, vier Höllen: Pot-Parsing, Deal-Animationen, Ghost-Cards und ein Thread der einfach stirbt. 30 Bugs, eine Woche, viel Kaffee."
category: "Bug-Jagd"
tags: ["bugs", "debugging", "pot-parsing", "deal-animation", "thread-safety"]
draft: false
---

Eine Woche. 30 Bugs. Fix rate: ~4.3 Bugs pro Tag.

Das war Woche 4 der Bot-Entwicklung. Nachdem die Grundarchitektur stand, ging's ans Eingemachte: den Bot dazu bringen, **zuverlässig** zu spielen — nicht nur "irgendwie".

Hier sind die vier schlimmsten. Die wo ich dachte: "Das war's, das Projekt stirbt heute."

---

## Akt 1: Pot-Parsing — Österreichisches Format

**Problem:** Der Bot dachte der Pot wäre 1.200€, obwohl er 1,20€ war.

**Warum?** win2day läuft auf einem österreichischen Casino-Client. Und Österreicher formatieren Zahlen anders: Punkt = Tausender, Komma = Dezimal.

```
Pot auf dem Screen: "1,20"
parseFloat("1,20") → 1.2 ✓ (Glück gehabt)

Pot auf dem Screen: "12,50"
parseFloat("12,50") → 12.5 ✓

Aber dann:
Pot auf dem Screen: "1.200,50"
parseFloat("1.200,50") → 1.0 ✗ (STOPP am ersten Punkt)
```

Der Bot hat einmal versucht, mit 25bb in einen Pot zu pushen den er für 200bb hielt, weil `parseFloat("2.500,00")` → `2` zurückgab. Der echte Pot war 25€, der Bot dachte 2500€. Rate wer gefoldet hat.

**Fix:** Zwei Regex-Replacements vor dem Parsen:
```python
def parse_pot(p: str) -> float:
    """Österreichisches Zahlenformat normalisieren."""
    # 1. Entferne Tausender-Punkte
    p = re.sub(r'\.(?=\d{3})', '', p)
    # 2. Komma → Punkt für Dezimal
    p = p.replace(',', '.')
    # 3. Währungs-Symbole und Whitespace killen
    p = re.sub(r'[€$\s]', '', p)
    return float(p)
```

**Lesson Learned:** Internationalisierung ist nicht nur "Hallo Welt" in 5 Sprachen. Ein verdammtes Zahlenformat kann deinen Bot bankrott machen.

---

## Akt 2: Deal-Animation — 1-2 Karten flackern

**Problem:** Der Bot hat Entscheidungen getroffen während Karten noch auf dem Tisch landeten.

Das passiert: Preflop sind 2 Karten gedealt. Aber Playtech rendered die Karten **nacheinander**. Frame 1: Erste Karte sichtbar. Frame 2: Beide Karten sichtbar. Der Bot liest in Frame 1 und denkt: "Board = [A♠], Phase = Flop? Reraise!"

**Fix:** Der Pending-Tracker. Keine Entscheidung bevor sich der DOM-Hash für 500ms nicht geändert hat.

```python
class PendingTracker:
    def __init__(self, stability_ms=500):
        self._hash = None
        self._timer = None
        self._stability_ms = stability_ms
        
    def on_change(self, state_hash: str):
        if state_hash == self._hash:
            return  # Nichts neues
        self._hash = state_hash
        if self._timer:
            self._timer.cancel()
        self._timer = asyncio.create_task(
            self._wait_and_emit()
        )
    
    async def _wait_and_emit(self):
        await asyncio.sleep(self._stability_ms / 1000)
        self._timer = None
        emit("stable_state", self._hash)
```

**Lesson Learned:** Der DOM lügt. "Was du siehst" ist nicht "was gerade passiert". Animationen sind State-Übergänge — und State-Übergänge muss man cachen, nicht verarbeiten.

---

## Akt 3: Ghost Cards — Der Bot sieht Karten die nicht da sind

**Problem:** Nach 3-4 Händen tauchen plötzlich Ghost Cards auf. Der Bot denkt er hält A♠K♠, aber in Wirklichkeit liegen die Karten vom letzten Board noch irgendwo im DOM.

Playtech löscht alte Karten nicht sofort aus dem DOM — sie setzt nur `visibility: hidden` oder verschiebt sie per CSS ins Offscreen. Der DOM-Reader sieht `display: block` in einem versteckten Container und denkt: "Das ist meine Hole Card!"

**Fix:** Position-Validierung. Nur Karten innerhalb des aktiven Spielbereichs akzeptieren, plus einen Game-Phase-Check.

```python
def is_active_card(element) -> bool:
    """Prüft ob eine Karte wirklich zur aktuellen Hand gehört."""
    rect = element.getBoundingClientRect()
    # Karten außerhalb des aktiven Bereichs ignorieren
    if rect.top < TABLE_TOP or rect.left < TABLE_LEFT:
        return False
    # Cards im muck-Bereich (letzte Hand) ignorieren
    if element.closest('.muck-area, .last-hand'):
        return False
    return True
```

**Lesson Learned:** `visibility: hidden` heißt nicht "existiert nicht". Der DOM speichert alles — dein Parser muss der Filter sein.

---

## Akt 4: Thread-Death — Der Bot stirbt ohne Spur

**Problem:** Der Bot läuft 20 Minuten, 30 Minuten, dann — nichts. Kein Crash, keine Exception, kein Log. Der Main-Process lebt, aber der Spiel-Thread ist einfach tot. `thread.is_alive()` → `False`.

**Warum?** `Thread running = True` aber der Thread hat eine uncaught Exception geworfen die nirgendwo geloggt wurde. Der Thread stirbt, `running=True` bleibt, der Main-Loop hält die Tür auf, aber keiner geht durch.

**Fix:** Global Exception Handler + Dead-Thread-Detektor + Auto-Restart.

```python
def bot_thread_main():
    try:
        while running:
            play_hand()
    except Exception as e:
        logger.critical(f"Thread gestorben: {e}", exc_info=True)
        # Dead-Thread-Detektor im Main-Loop
        thread_status['last_alive'] = time.time()
        thread_status['error'] = str(e)

# Im Main-Loop:
async def watchdog():
    while True:
        await asyncio.sleep(5)
        if not bot_thread.is_alive():
            if time.time() - thread_status['last_alive'] > 10:
                logger.warning("Thread tot, restart...")
                start_bot_thread()
```

**Lesson Learned:** `running=True` sagt nichts über den tatsächlichen Zustand des Threads. Ein Flag ist kein Lebenszeichen. Heartbeat-Checks sind kein Luxus, sie sind überlebensnotwendig.

---

## Die anderen 26 Bugs

Nur die Highlights der restlichen Woche:

- **Double-Click-Protection** — Bot klickt Raise, Pot ändert sich nochmal, Bot klickt Raise nochmal. Resultat: versehentlich All-in.
- **Session-Timeout Handling** — win2day loggt dich nach 4 Stunden aus. Mitten in der Hand.
- **Seat-Shuffle** — Du sitzt auf Seat 3, nächste Hand auf Seat 5. Die Stack-Map flippt.
- **UTF-8 Encoding in Player-Names** — "Müller" wird zu "MÃ¼ller", Regex-matched auf keine bekannte Range.
- **Blind-Level Timer** — Bot detected nicht wenn Blinds steigen, spielt weiter mit alten Pot Odds.
- **Bet-Slider Math** — `Math.floor(pot * 0.75)` ≠ `max_bet` wenn Shortstack am Tisch.

## Fazit

Drei Dinge hab ich gelernt:

1. **Paranoid programmieren.** Jeder DOM-Wert ist ein Lügner bis du ihn validiert hast.
2. **Jeder Thread wird sterben.** Akzeptier es. Bau den Restart ein bevor er stirbt.
3. **Logging rettet Leben.** Ohne detailiertes Log findest du keinen Bug. 30 Bugs = 30 Log-Messages die mir den Weg gezeigt haben.

Der Bot läuft jetzt stabil durch 500+ Hände ohne einen dieser Bugs. Aber ich weiß: Bug #31 kommt. Er ist nur noch nicht aufgetaucht.