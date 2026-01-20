# Sporttag - Auswertungs-Webapp

Eine Web-Anwendung zur Erfassung und Auswertung von Sporttag-Resultaten. Ersetzt die bisherige Excel/Forms-Lösung durch eine moderne, einfach zu bedienende Webapp.

## Features

- **Admin-Bereich**: Konfiguration von Event-Name, Datum, Teamfarben, Disziplinen und Gruppen
- **Eingabeformular**: Einfaches Eintragen von Resultaten durch Postenverantwortliche
- **Live-Rangliste**: Automatische Berechnung und Anzeige der Gesamtrangliste mit Auto-Refresh
- **Flexible Bewertung**: Pro Disziplin konfigurierbar, ob höhere oder niedrigere Werte besser sind
- **Rangpunktesystem**: Automatische Umrechnung der Rohwerte in Rangpunkte

## Installation

### Voraussetzungen

- Node.js (v18 oder höher)
- npm

### Setup

1. Repository klonen:
```bash
git clone <repository-url>
cd Sporttag
```

2. Abhängigkeiten installieren:
```bash
# Im Hauptverzeichnis
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### Entwicklung starten

**Backend starten** (Port 3001):
```bash
cd backend
npm run dev
```

**Frontend starten** (Port 5173):
```bash
cd frontend
npm run dev
```

Die App ist dann erreichbar unter: http://localhost:5173

## Nutzung

### 1. Admin-Bereich einrichten

1. Öffne die App und gehe zu **Admin**
2. Konfiguriere Event-Name und Datum
3. Füge die Teamfarben hinzu (z.B. "Blau", "Grün")
4. Erstelle die Disziplinen/Posten:
   - Name der Disziplin
   - Einheit (optional, z.B. "Punkte", "Sekunden")
   - Bewertungsart: "Höher ist besser" oder "Niedriger ist besser"
5. Erstelle die Gruppen:
   - Einzeln oder mehrere auf einmal (Tiernamen werden automatisch für jede Farbe erstellt)

### 2. Resultate eintragen

1. Gehe zu **Resultate eintragen**
2. Wähle den Posten/Disziplin
3. Wähle die Gruppe
4. Trage den Wert ein
5. Speichern

### 3. Rangliste anzeigen

- Die **Rangliste**-Seite zeigt automatisch alle Resultate
- Die Rangliste wird alle 5 Sekunden automatisch aktualisiert
- Podium für Top 3 wird prominent angezeigt
- Detaillierte Tabelle mit allen Gruppen und Disziplinen

## Technologie

- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Frontend**: React, Vite, React Router
- **Datenbank**: SQLite (Datei: `backend/sporttag.db`)

## Projektstruktur

```
Sporttag/
├── backend/
│   ├── src/
│   │   ├── index.js      # Express Server & API-Endpoints
│   │   └── database.js   # SQLite Datenbank-Setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Haupt-Komponente mit Routing
│   │   ├── api.js        # API-Aufrufe
│   │   └── pages/        # Seiten-Komponenten
│   └── package.json
└── package.json
```

## API-Endpoints

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | /api/config | Event-Konfiguration laden |
| PUT | /api/config | Event-Konfiguration speichern |
| GET | /api/disciplines | Alle Disziplinen laden |
| POST | /api/disciplines | Neue Disziplin erstellen |
| PUT | /api/disciplines/:id | Disziplin bearbeiten |
| DELETE | /api/disciplines/:id | Disziplin löschen |
| GET | /api/groups | Alle Gruppen laden |
| POST | /api/groups | Neue Gruppe erstellen |
| POST | /api/groups/bulk | Mehrere Gruppen erstellen |
| DELETE | /api/groups/:id | Gruppe löschen |
| GET | /api/results | Alle Resultate laden |
| POST | /api/results | Resultat eintragen/aktualisieren |
| DELETE | /api/results/:id | Resultat löschen |
| GET | /api/rankings | Berechnete Rangliste laden |
