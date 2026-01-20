# Sporttag - Auswertungs-Webapp

Eine Web-Anwendung zur Erfassung und Auswertung von Sporttag-Resultaten. Ersetzt die bisherige Excel/Forms-Lösung durch eine moderne, einfach zu bedienende Webapp.

## Features

- **Admin-Bereich**: Konfiguration von Event-Name, Datum, Teamfarben, Disziplinen und Gruppen
- **Eingabeformular**: Einfaches Eintragen von Resultaten durch Postenverantwortliche (Mobile-optimiert)
- **Live-Rangliste**: Automatische Berechnung und Anzeige der Gesamtrangliste mit Auto-Refresh
- **Flexible Bewertung**: Pro Disziplin konfigurierbar, ob höhere oder niedrigere Werte besser sind
- **Rangpunktesystem**: Automatische Umrechnung der Rohwerte in Rangpunkte
- **Resultate bearbeiten**: Im Admin-Bereich können Resultate nachträglich korrigiert werden

## Deployment auf Firebase

Die App ist für Firebase (Hosting + Firestore) optimiert.

**Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für eine ausführliche Schritt-für-Schritt-Anleitung.**

### Kurzübersicht

1. Firebase-Projekt erstellen auf [console.firebase.google.com](https://console.firebase.google.com/)
2. Firestore-Datenbank aktivieren
3. Web-App registrieren und Konfiguration kopieren
4. `frontend/.env.local` erstellen mit Firebase-Konfiguration
5. `firebase deploy`

## Lokale Entwicklung

### Voraussetzungen

- Node.js (v18+)
- npm
- Firebase-Projekt (für Datenbank)

### Setup

```bash
# Repository klonen
git clone <repository-url>
cd Sporttag

# Frontend-Abhängigkeiten installieren
cd frontend
npm install

# Firebase-Konfiguration erstellen
cp .env.example .env.local
# → .env.local mit eigenen Firebase-Daten ausfüllen

# Entwicklungsserver starten
npm run dev
```

Die App läuft dann auf http://localhost:5173

## Nutzung

### 1. Admin-Bereich einrichten

1. Öffne die App und gehe zu **Admin** (Link nur auf Desktop/Rangliste sichtbar)
2. Konfiguriere Event-Name und Datum
3. Füge die Teamfarben hinzu (z.B. "Blau", "Grün")
4. Erstelle die Disziplinen/Posten:
   - Name der Disziplin
   - Einheit (optional, z.B. "Punkte", "Sekunden")
   - Bewertungsart: "Höher ist besser" oder "Niedriger ist besser"
5. Erstelle die Gruppen:
   - Einzeln oder mehrere auf einmal (Tiernamen werden automatisch für jede Farbe erstellt)

### 2. Resultate eintragen (Postenverantwortliche)

1. Öffne die App auf dem Smartphone
2. Wähle beim ersten Mal deinen Posten (wird gespeichert)
3. Für jede Gruppe:
   - Farbe antippen
   - Tier/Gruppe antippen (bereits erfasste sind ausgegraut)
   - Wert eingeben
   - Speichern

### 3. Rangliste anzeigen

- Die **Rangliste**-Seite zeigt automatisch alle Resultate
- Automatische Aktualisierung alle 5 Sekunden
- Podium für Top 3 prominent angezeigt
- Detaillierte Tabelle mit allen Gruppen und Disziplinen

### 4. Resultate korrigieren (Admin)

- Im Admin-Bereich unter "Resultate verwalten"
- Filter nach Posten oder Farbe
- Klick auf Wert → bearbeiten
- Oder löschen und neu erfassen

## Technologie

- **Frontend**: React 18, Vite, React Router
- **Backend**: Firebase (Firestore)
- **Hosting**: Firebase Hosting
- **Styling**: CSS (kein Framework, Mobile-first)

## Projektstruktur

```
Sporttag/
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Haupt-Komponente mit Routing
│   │   ├── firebase.js       # Firestore-Funktionen
│   │   ├── firebaseConfig.js # Firebase-Konfiguration
│   │   └── pages/            # Seiten-Komponenten
│   │       ├── Admin.jsx     # Admin-Bereich
│   │       ├── EntryForm.jsx # Eingabeformular
│   │       └── Rankings.jsx  # Rangliste
│   └── package.json
├── firebase.json             # Firebase-Konfiguration
├── firestore.rules           # Firestore Security Rules
├── firestore.indexes.json    # Firestore-Indizes
└── DEPLOYMENT.md             # Deployment-Anleitung
```

## Firestore-Datenstruktur

```
config/
  └── event
      ├── event_name: "Sporttag 2025"
      ├── event_date: "2025-06-20"
      └── colors: ["Blau", "Grün"]

disciplines/
  └── {id}
      ├── name: "Bottle-Flip"
      ├── unit: "Treffer"
      └── higher_is_better: true

groups/
  └── {id}
      ├── name: "Löwe"
      └── color: "Blau"

results/
  └── {id}
      ├── group_id: "abc123"
      ├── discipline_id: "xyz789"
      ├── value: 15
      └── created_at: Timestamp
```
