---
title: "Wie Casinos Bots erkennen — Anti-Detection und die Katze-und-Maus-Spiel"
date: 2026-05-20
description: "Timing-Analysen, Maus-Tracking, Browser-Fingerprints. Wie Poker-Rooms Bots identifizieren und was man dagegen tun kann."
category: "Technik"
tags: ["anti-detection", "playwright-stealth", "bot-detection", "fingerprint", "timing"]
draft: false
---

Jeder Click ist ein Hinweis. Jede Millisekunde zwischen Action und Raise sagt etwas aus. Und Casinos haben genug Daten um ein Profil zu erstellen — nicht von dir, sondern von **wie** du spielst.

Hier ist was ich über Bot Detection gelernt habe. Aus erster Hand.

## Was Casinos sehen

Wenn du auf win2day Poker spielst, läuft nicht nur das Spiel im Browser. Im Hintergrund sammelt der Client Daten:

### 1. Timing-Analyse

Der offensichtlichste Indikator. Ein Bot reagiert in ~200-400ms. Ein Mensch braucht ~2-8 Sekunden für Standard-Entscheidungen und ~15-30 Sekunden für schwierige Spots.

```python
# Bot-Timing: Zu gleichmäßig, zu schnell
reaction_times = [342, 358, 341, 355, 348]  # σ = 7ms
# Mensch-Timing: Variabel, langsamer
reaction_times = [3400, 5200, 2800, 15000, 4300]  # σ = 4700ms
```

Casinos tracken die Zeit zwischen "Action ist dran" und "Spieler klickt". Wenn du immer zwischen 300-400ms reagierst — 100% Bot.

**Gegenmaßnahme:** Künstliche Verzögerung + Zufallsvariation.

```python
import random
import asyncio

async def human_click(page, selector: str):
    """Click mit menschlichem Timing."""
    # Basis-Verzögerung
    base_delay = random.uniform(1.5, 4.0)  # 1.5-4 Sekunden
    
    # Zusätzliche Variation für schwierige Entscheidungen
    if random.random() < 0.15:  # 15% "Denkpause"
        base_delay += random.uniform(3.0, 8.0)
    
    await asyncio.sleep(base_delay)
    await page.click(selector)
```

### 2. Maus-Tracking

Menschen bewegen die Maus nicht linear. Wir haben Kurven, Zögern, Overshoot.

Ein Bot klickt direkt auf den Button — Mausposition springt von (0,0) auf (500, 400) und klickt. Ein Mensch fährt mit der Maus über den Tisch, zögert vielleicht kurz, und klickt dann.

Casinos nutzen JS-Libraries um Mausbewegungen zu tracken: `mousemove`, `mouseover`, `mouseout` Events werden geloggt.

**Gegenmaßnahme:** Playwrights `page.mouse.move()` mit Bézier-Kurven.

```python
async def human_mouse_move(page, target_x: int, target_y: int):
    """Maus mit Bézier-Kurve bewegen, nicht linear."""
    current_pos = await page.evaluate(
        '({x: window.mouseX || 0, y: window.mouseY || 0})'
    )
    
    # Bézier-Kontrollpunkte (Start, Kurve1, Kurve2, Ende)
    cp1 = (
        current_pos['x'] + random.randint(-50, 150),
        current_pos['y'] + random.randint(-50, 150)
    )
    cp2 = (
        target_x + random.randint(-30, 30),
        target_y + random.randint(-30, 30)
    )
    
    # 10-15 Zwischenschritte
    steps = random.randint(10, 15)
    for t in range(1, steps + 1):
        progress = t / steps
        # Cubic Bézier
        x = bezier_point(current_pos['x'], cp1[0], cp2[0], target_x, progress)
        y = bezier_point(current_pos['y'], cp1[1], cp2[1], target_y, progress)
        
        await page.mouse.move(x, y)
        await asyncio.sleep(random.uniform(0.01, 0.03))
```

### 3. Browser-Fingerprinting

Casinos nutzen Fingerprint.js oder eigene Implementationen. Sie sammeln:

- **Canvas Fingerprint** — Wie rendert dein Browser ein verstecktes Canvas?
- **WebGL Fingerprint** — GPU-Informationen (Renderzeit, Vendor, Renderer)
- **Audio Fingerprint** — Wie verarbeitet dein Browser Audio-Signale?
- **Font Fingerprint** — Welche Schriftarten sind installiert?
- **Navigator Properties** — `navigator.webdriver`, `navigator.plugins`, `navigator.languages`

**Der klassische Fehler:** `navigator.webdriver` ist `true` wenn Playwright/ChromeDriver den Browser steuert.

**Gegenmaßnahme:** Playwright-Stealth + Patches.

```python
# Playwright-Stealth Patches
await page.add_init_script("""
    // Override navigator.webdriver
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });
    
    // Override chrome.runtime
    window.chrome = {
        runtime: { /* ... */ }
    };
    
    // Plugin-Array normalisieren
    Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
    });
    
    // Languages normalisieren
    Object.defineProperty(navigator, 'languages', {
        get: () => ['de-DE', 'de', 'en-US', 'en']
    });
""")
```

### 4. Verhaltensanalyse (Behavioral Biometrics)

Das ist die neue Welle. Casinos tracken nicht nur **was** du tust, sondern **wie** du es tust.

- **Klick-Druck:** Wie lange hältst du die Maustaste? (Menschen: ~100-300ms. Bots: ~1ms)
- **Scroll-Verhalten:** Menschen scrollen ruckartig. Bots scrollen perfekt.
- **Tab-Wechsel:** Ein Bot wechselt nie den Tab während einer Hand.
- **Klick-Position:** Menschen klicken nicht immer auf die Pixel-Mitte eines Buttons.

```python
async def human_click_random_offset(page, selector: str):
    """Click mit zufälligem Offset vom Button-Zentrum."""
    element = page.locator(selector)
    box = await element.bounding_box()
    
    # Zufälliger Offset innerhalb des Buttons
    x = box['x'] + random.uniform(2, box['width'] - 2)
    y = box['y'] + random.uniform(2, box['height'] - 2)
    
    # Maus bewegen und klicken
    await human_mouse_move(page, x, y)
    await asyncio.sleep(random.uniform(0.05, 0.2))
    await page.mouse.click(x, y)
```

## Katze und Maus — Der ewige Kampf

Es gibt keine perfekte Anti-Detection. Jeder Bot wird irgendwann erkannt. Die Frage ist: **Wie lange nicht?**

| Maßnahme | Wirksamkeit | Kosten (Dev-Zeit) |
|----------|-------------|-------------------|
| Timing-Varianz | Hoch | Gering (30 Min) |
| Maus-Tracking | Mittel | Mittel (2 Stunden) |
| Stealth-Patches | Hoch | Mittel (1 Stunde) |
| Verhaltensanalyse | Niedrig (heute) | Hoch (>1 Woche) |
| Fingerprint-Spoofing | Mittel | Hoch (laufend) |

**Meine Strategie:** Timing-Varianz + Stealth-Patches als Standard. Maus-Tracking für wichtige Sessions. Verhaltensanalyse — noch nicht, der Aufwand ist zu hoch.

## Der wichtigste Faktor

Rate was den Bot am meisten schützt? **Nicht die Technik. Sondern die Limit-Struktur.**

NL10 und NL25 werden weniger gescannt. Ein Mikro-Limit-Bot fällt weniger auf als ein NL200-Bot. Die Casino-Sicherheitsteams haben begrenzte Ressourcen — sie jagen die großen Fische.

Und genau da liegt der Punkt: Wer Bots für Echtgeld-Betrug baut, wird gefunden. Wer Bots für Bildung baut und kleine Limits spielt — der fliegt unter dem Radar.

Ist das moralisch sauber? Darüber rede ich im Artikel "Die Wahrheit über Poker Automatisierung".

## Fazit

Bot Detection ist ein Wettrüsten. Casinos werden besser, Bots werden besser. Ich investiere in Anti-Detection — aber ich weiß dass es keine Garantie gibt.

Der beste Schutz? Spiel klein. Sei diskret. Und hab nen Plan B für wenn der Account gesperrt wird.

Weil das passieren wird. Irgendwann.