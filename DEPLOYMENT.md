# Sporttag-App auf Firebase deployen

Diese Anleitung führt dich Schritt für Schritt durch das Deployment der Sporttag-App auf Firebase.

## Voraussetzungen

- Google-Konto
- Node.js installiert (v18+)
- npm installiert

## Schritt 1: Firebase-Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf **"Projekt hinzufügen"**
3. Gib einen Projektnamen ein (z.B. "sporttag-2025")
4. Google Analytics kannst du deaktivieren (nicht nötig)
5. Klicke **"Projekt erstellen"**

## Schritt 2: Firestore-Datenbank aktivieren

1. Im Firebase-Projekt, gehe zu **"Build"** → **"Firestore Database"**
2. Klicke **"Datenbank erstellen"**
3. Wähle **"Im Testmodus starten"** (für den Anfang)
4. Wähle einen Standort (z.B. `europe-west6` für Zürich)
5. Klicke **"Aktivieren"**

## Schritt 3: Web-App registrieren

1. Gehe zu **Projekteinstellungen** (Zahnrad oben links)
2. Scrolle runter zu **"Deine Apps"**
3. Klicke auf das **Web-Symbol** (</>)
4. Gib einen App-Namen ein (z.B. "Sporttag Web")
5. **Firebase Hosting aktivieren** anhaken
6. Klicke **"App registrieren"**
7. **WICHTIG**: Kopiere die Konfigurationswerte:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## Schritt 4: Firebase-Konfiguration eintragen

1. Erstelle die Datei `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

2. Öffne `frontend/.env.local` und fülle die Werte aus:

```
VITE_FIREBASE_API_KEY=dein-api-key-hier
VITE_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dein-projekt-id
VITE_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Schritt 5: Firebase CLI installieren

```bash
npm install -g firebase-tools
```

## Schritt 6: Bei Firebase anmelden

```bash
firebase login
```

Ein Browserfenster öffnet sich zur Anmeldung.

## Schritt 7: Firebase-Projekt verknüpfen

```bash
# Im Hauptverzeichnis (Sporttag/)
firebase use --add
```

Wähle dein erstelltes Projekt aus der Liste.

## Schritt 8: Frontend bauen

```bash
cd frontend
npm install
npm run build
```

Dies erstellt den `dist`-Ordner mit der produktionsfertigen App.

## Schritt 9: Firestore-Regeln deployen

```bash
# Im Hauptverzeichnis
firebase deploy --only firestore:rules
```

## Schritt 10: App deployen

```bash
firebase deploy --only hosting
```

Nach erfolgreichem Deployment siehst du die URL deiner App:
```
✔ Hosting URL: https://dein-projekt.web.app
```

## Fertig!

Deine App ist jetzt online unter:
- `https://dein-projekt.web.app`
- `https://dein-projekt.firebaseapp.com`

---

## Weitere Deployments

Nach Änderungen am Code:

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

---

## Tipps

### Eigene Domain verbinden

1. Firebase Console → Hosting → Domain hinzufügen
2. Folge den Anweisungen zur DNS-Konfiguration

### Daten exportieren/importieren

```bash
# Daten exportieren
firebase firestore:export ./backup

# Daten importieren
firebase firestore:import ./backup
```

### Lokales Testen

```bash
# Frontend starten (mit Firebase)
cd frontend
npm run dev
```

Die App läuft dann auf http://localhost:5173 und verbindet sich direkt mit Firestore.

---

## Fehlerbehebung

### "Permission denied" Fehler
→ Prüfe die Firestore-Regeln in `firestore.rules`

### "Project not found"
→ Führe `firebase use --add` erneut aus

### Build-Fehler
→ Prüfe ob alle npm-Pakete installiert sind: `npm install`
