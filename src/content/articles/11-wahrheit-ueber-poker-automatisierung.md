---
title: "Die Wahrheit über Poker Automatisierung — Grenzen, Ethik, und warum ich es trotzdem mache"
date: 2026-05-20
description: "Legale Grauzonen, ethische Fragen und die harte Realität: Ein Bot macht dich nicht reich. Hier ist die ungeschönte Wahrheit."
category: "Tagebuch"
tags: ["ethik", "legal", "disclaimer", "automation", "fair-use", "real-talk"]
draft: false
---

Ich baue einen Poker Bot. Das ist die Wahrheit.

Die unbequeme Wahrheit: **Es ist eine legale Grauzone.** Und ich will hier nicht so tun als wäre alles klar.

## Disclaimer (muss sein)

**Poker Basecamp ist ein Bildungsprojekt.** Der Bot wurde entwickelt um Poker-Mechaniken zu verstehen, GTO-Konzepte zu testen, und die Grenzen von Browser-Automation auszuloten.

Der Bot wird **nicht** zum Betrug an Echtgeld-Spielen eingesetzt. Die hier dokumentierten Techniken sind für:
- **Forschung:** Wie funktionieren Browser-Automation und DOM-Parsing?
- **Bildung:** Wie lassen sich GTO-Konzepte in Code übersetzen?
- **Experimente:** Wo liegen die Grenzen von KI-gestütztem Pokerspiel?

**Du bist selbst verantwortlich** für das was du mit diesem Wissen machst. Ich rate dir: Benutz keinen Bot an Echtgeld-Tischen. Die Risiken sind real — Account-Sperre, Geldverlust, im Extremfall rechtliche Konsequenzen.

Jetzt wo das aus dem Weg ist: der echte Talk.

## Was ein Bot KANN

- **Diszipliniert spielen** — Keine Tilt-Hände, keine Bad-Beats-Revenge
- **Mathematisch korrekte Entscheidungen** — MDF, Pot Odds, ICM in Echtzeit
- **Gleichbleibend** — 1000 Hände, 100.000 Hände, gleiche Qualität
- **Multi-Tabling** — 4, 6, 8 Tische gleichzeitig (wenn die Hardware mitspielt)

Das klingt nach einem Super-Player. Ist es nicht.

## Was ein Bot NICHT kann

- **Menschen lesen** — Body Language, Tells, "er hat gezögert" — alles Sachen die ein Bot nicht sieht
- **Meta-Strategie** — "Dieser Gegner ist tilting, ich reize ihn mehr" — Bots haben keine Psychologie
- **Unstrukturierte Spots** — Wenn die Nash-Tabelle endet und der CFR-Spot nicht in der Library ist, spielt der Bot blind
- **Rake schlagen** — In NL2-NL10 frisst der Rake den Gewinn. Der Bot kann +5bb/100 machen und trotzdem verlieren
- **Gegen gute Spieler gewinnen** — Ein GTO-Bot ist break-even gegen einen soliden Regular. Der Profit kommt aus Fisch

Die Realität: **Ein Bot ist kein Gelddrucker.** Er ist ein Werkzeug zum Lernen.

## Die Ethik-Frage

Ich hab lange mit mir gerungen ob ich diesen Bot bauen und vor allem ob ich öffentlich darüber schreiben soll.

**Argumente dagegen:**
- Du ermöglichst anderen Bots zu bauen — manche werden sie missbrauchen
- Du dokumentierst Exploits von Casino-Plattformen
- Du machst ein ohnehin problematisches Thema salonfähig

**Argumente dafür:**
- Transparenz > Geheimniskrämerei
- Wissen sollte frei sein — Casinos wissen längst wie Bots funktionieren
- Ein Bildungs-Bot ist was anderes als ein Betrugs-Bot
- Die Poker-Industrie profitiert von mehr technischem Verständnis

Ich hab mich für **radikale Transparenz** entschieden.

Der gesamte Code, die Bugs, die Architektur — alles dokumentiert. Kein "Secret System" BS. Nur: hier ist was ich gemacht habe, hier ist wie es funktioniert, hier sind die Risiken.

**Warum?** Weil die Alternative ist dass Leute im Darknet halbgaren Bot-Code für 500€ kaufen, keine Ahnung haben was sie tun, gesperrt werden, und dann heulen. Wenn ich zeige wie es wirklich geht — inklusive der Limits und Gefahren — dann wissen Leute worauf sie sich einlassen.

## Die legalen Grenzen

Deutschland: § 17 Abs. 2 ZAG + § 284 StGB. Unerlaubte Glücksspiel-Teilnahme ist strafbar. Automatisierte Teilnahme fällt darunter wenn der Betreiber es nicht erlaubt.

**Die Situation aktuell:**
- **Österreich (win2day):** Automatisierte Zugriffe verboten in den AGB. Bot-Erkennung aktiv. Account-Sperre wahrscheinlich.
- **Deutschland:** Online-Poker-Markt reguliert. Automatisierung durch Dritte nicht explizit geregelt, aber AGB-Verstoß.
- **International:** Von "geduldet" (manche .com Rooms) bis "strafbar" (Frankreich, Italien mit eigenen Lizenzen).

**Meine Position:** Der Bot wird nur für Bildungszwecke und unter kontrollierten Bedingungen (eigener Account, kleine Limits) eingesetzt. Kein Betrieb im großen Stil, kein Fremdkapital, kein "Bot Farming".

## Fair Use — Gibt's das?

Nein. Es gibt keine "Fair Use"-Klausel für Botting. Entweder die AGB erlauben es (niemals) oder nicht.

Aber es gibt eine ethische Unterscheidung zwischen:

| Bot-Typ | Bewertung |
|---------|-----------|
| Bildungs-Bot, kleine Limits, eigene Kohle | Grauzone, aber vertretbar |
| Multi-Account-Bot, Profite maximieren | Eindeutig Betrug |
| Bot-Farm, 50 Accounts, Fremdkapital | Illegal + dumm |
| Bot als Lernwerkzeug (Analyse, kein Live-Spiel) | Unbedenklich |

Poker Basecamp fällt in die erste und letzte Kategorie.

## Was ich anders machen würde

Wenn ich nochmal anfangen würde:

1. **Nur Analysis-Modus** — Bot analysiert Hände ohne zu spielen. Das ist 100% legal und genauso lehrreich.
2. **Kein Echtgeld** — Play Money oder private Tische. Same Code, kein Risiko.
3. **Open Source von Tag 1** — Transparenz ist der beste Schutz gegen Missbrauchsvorwürfe.

Aber: Ein Bot der nicht spielt ist wie ein Auto das in der Garage steht. Man lernt am meisten wenn er fährt — und crasht.

## Fazit

Poker Automatisierung ist eine Grauzone. Wer sie betreibt, muss die Risiken kennen und verantwortungsvoll handeln.

Ich mache es trotzdem. Nicht um reich zu werden, sondern weil mich das Problem fasziniert. Und weil ich glaube dass radikale Transparenz besser ist als geheime Bot-Netzwerke.

**Du solltest keine Bots bauen um Geld zu verdienen.** Du verlierst. Entweder Geld, oder Account, oder beides.

**Du solltest Bots bauen wenn dich die Technik interessiert.** Der Code ist das Ziel. Das Spielen ist der Nebeneffekt.

Poker Basecamp ist kein Casino. Es ist ein Labor.