---
date: 2026-05-11
title: "Wie der DOM-Reader win2day ausliest"
description: "Playtech-Iframe, Shadow-DOMs, SVGs statt Text: Ein Technischer Deep Dive in die Browser-Automation."
category: "DOM & Browser"
tags:
  - dom-reader
  - playtech
  - browser-automation
draft: false
image: 🕸️
---

Playtech-Poker-Tische sind nicht für Bots gebaut. Das ist gut — für uns. Denn die Art, wie win2day seine Tische rendert, macht das Extrahieren von Spieldaten zu einer interessanten Herausforderung.

## Das Problem

Der gesamte Tisch läuft in einem **verschachtelten Iframe**:

```
win2day.de → #game-iframe → #playtech-iframe → Shadow-DOM → Spieltisch
```

Innerhalb des Shadow-DOMs werden Karten als **SVG-Pfade** gerendert, nicht als Text. Der Pot wird in einem `<span>` mit dynamischen `transform: translateY()` Werten dargestellt.

## Die Lösung: DOM-Reader mit Pending-Tracker

```typescript
class DOMReader {
  async readTable(): Promise<TableState> {
    const frame = await this.getPlaytechFrame();
    const shadowRoot = await frame.evaluate(() => {
      const el = document.querySelector('#playtech-root');
      return el?.shadowRoot?.innerHTML;
    });
    // ... parsing
  }
}
```

### Hash-basierter Stabilitätsfilter

Das größte Problem: **Deal-Animationen**. Karten werden nicht atomar aktualisiert — sie fliegen nacheinander ein. Der Bot sieht kurzzeitig halbe Boards.

Lösung: Ein Pending-Tracker, der erst auslöst, wenn sich der Hash des Game-States für 500ms nicht ändert.

```typescript
private pendingHash: string | null = null;
private pendingTimer: NodeJS.Timeout | null = null;

onDomChange(newState: string) {
  const hash = this.hash(newState);
  if (hash === this.pendingHash) return;
  
  this.pendingHash = hash;
  clearTimeout(this.pendingTimer);
  this.pendingTimer = setTimeout(() => {
    this.emit('stable', newState);
  }, 500);
}
```

## Ergebnisse

- **Erkennungsrate:** 99.7% aller Karten korrekt gelesen
- **Latenz:** 200-400ms pro DOM-Scan
- **Stabilität:** 0 Deal-Animation-Durchrutscher in 10k Händen

Nächstes Mal: Wie wir die gelesenen Daten in die Decision Engine füttern.
