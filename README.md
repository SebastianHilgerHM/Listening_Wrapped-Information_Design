# Listening Wrapped - Spotify Visualisierung

> **🌐 Live Demo:** [https://SebastianHilgerHM.github.io/Listening_Wrapped-Information_Design/](https://SebastianHilgerHM.github.io/Listening_Wrapped-Information_Design/)

Eine interaktive 3D-Visualisierung meiner Spotify-Hörgeschichte, mit Fokus auf Tempo und Danceability der gehörten Songs.

## Projektbeschreibung

Diese Website zeigt eine visuelle Aufbereitung meiner Spotify-Hördaten seit dem Abonnement von Spotify Premium. Die Visualisierung umfasst:

- **Vinyl-Ansicht**: 3D-Schallplatte mit Datenpunkten als Spirale
- **Liniendiagramm**: Zeitlicher Verlauf von Tempo und Danceability
- **Equalizer-Ansicht**: Jahresbasierte Balkenvisualisierung
- **Top 20 Liste**: Die meistgehörten Songs mit Daten zu Tempo und Danceability

## Voraussetzungen

- **Node.js**: Version 18.0.0 oder höher
- **npm**: Version 9.0.0 oder höher (kommt mit Node.js)

### Node.js installieren

Falls Node.js noch nicht installiert ist:
1. Besuche [nodejs.org](https://nodejs.org/)
2. Lade die LTS-Version herunter
3. Führe den Installer aus

Überprüfe die Installation:
```bash
node --version
npm --version
```

## Installation

1. **Repository klonen** (falls nicht bereits vorhanden):
   ```bash
   git clone <repository-url>
   cd "Site Code"
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```

## Lokale Entwicklung

Starte den Entwicklungsserver:
```bash
npm run dev
```

Die Website ist dann unter `http://localhost:5173` erreichbar.

Der Entwicklungsserver bietet:
- Hot Module Replacement (HMR) - Änderungen werden sofort angezeigt
- Automatisches Neuladen bei Dateiänderungen

## Production Build

Erstelle einen optimierten Build für die Produktion:
```bash
npm run build
```

Das Build-Ergebnis befindet sich im **`dist/`** Verzeichnis.

### Build-Vorschau

Um den Production Build lokal zu testen:
```bash
npm run preview
```

Die Vorschau ist dann unter `http://localhost:4173` erreichbar.

## Projektstruktur

```
Site Code/
├── dist/               # Build-Output (nach npm run build)
├── docs/               # Dokumentation
├── public/             # Statische Dateien (CSV-Daten, 3D-Modelle)
│   ├── top_20_tracks.csv
│   ├── weekly_summary.csv
│   └── models/
├── src/
│   ├── components/     # Svelte-Komponenten
│   ├── stores/         # Svelte Stores (State Management)
│   ├── utils/          # Hilfsfunktionen
│   ├── App.svelte      # Haupt-App-Komponente
│   └── main.js         # Einstiegspunkt
├── index.html          # HTML-Template
├── package.json        # Projektabhängigkeiten
├── svelte.config.js    # Svelte-Konfiguration
└── vite.config.js      # Vite-Konfiguration
```

## Technologien

- **[Svelte](https://svelte.dev/)** - Frontend-Framework
- **[Vite](https://vitejs.dev/)** - Build-Tool und Entwicklungsserver
- **[Three.js](https://threejs.org/)** - 3D-Grafik-Bibliothek
- **[D3.js](https://d3js.org/)** - Datenvisualisierung

## Deployment

### Option 1: GitHub Pages (Empfohlen)

Dieses Projekt ist für automatisches GitHub Pages Deployment konfiguriert.

**Einmalige Einrichtung in GitHub:**
1. Repository auf GitHub erstellen/pushen
2. Gehe zu **Settings** → **Pages**
3. Unter "Build and deployment":
   - **Source**: "GitHub Actions" auswählen
4. Pushe zum `main` Branch - Deployment startet automatisch!

**Nach dem Deployment:**
- Die Website ist erreichbar unter: `https://DEIN-USERNAME.github.io/Site-Code/`
- Bei jedem Push zum `main` Branch wird automatisch neu deployed

**Wichtig - Repository-Name anpassen:**
Falls dein Repository einen anderen Namen hat als `Listening_Wrapped-Information_Design`, ändere in `vite.config.js`:
```js
base: process.env.GITHUB_ACTIONS ? '/DEIN-REPO-NAME/' : '/',
```

### Option 2: Statisches Hosting

Der `dist/` Ordner kann auf jedem statischen Webhosting-Dienst deployed werden:

1. Build erstellen: `npm run build`
2. Inhalt des `dist/` Ordners hochladen zu:
   - Netlify
   - Vercel
   - Apache/Nginx Server
   - Beliebiger statischer Host

### Option 3: Lokaler Server

Für lokales Hosting (z.B. Präsentation):
```bash
npm run build
npm run preview
```

## Fehlerbehebung

### "Module not found" Fehler
```bash
rm -rf node_modules
npm install
```

### Port bereits belegt
Ändere den Port in `vite.config.js`:
```js
export default defineConfig({
  server: {
    port: 3000 // oder einen anderen freien Port
  }
})
```

### Build-Fehler
Stelle sicher, dass alle Abhängigkeiten installiert sind:
```bash
npm install
```

## Lizenz

Dieses Projekt wurde im Rahmen des Kurses "Information Design" (3. Semester) erstellt.

---