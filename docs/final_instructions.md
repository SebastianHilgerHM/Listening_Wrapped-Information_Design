# Issue 1: Code Cleanup and Optimization

## Title
Clean up unused code and optimize project structure

## Description
The website is functionally complete, but needs cleanup before deployment. Remove all unused code, dependencies, and files that are no longer needed.

## Tasks
- [ ] Remove any unused JavaScript/CSS files
- [ ] Clean up commented-out code blocks
- [ ] Remove unused npm packages from `package.json`
- [ ] Delete any test files or temporary code
- [ ] Remove unused images or assets from the project
- [ ] Consolidate duplicate code into reusable functions/components
- [ ] Remove console.log statements and debug code
- [ ] Ensure all imports are actually used
- [ ] Clean up any TODO comments or placeholder content

## Acceptance Criteria
- No unused files in the project directory
- All imported dependencies are actually used
- Code runs without errors or warnings
- Project structure is clean and organized
- Build process completes successfully

---

# Issue 2: Add Build Documentation and Process Setup

## Title
Dokumentation für Build-Prozess und Deployment-Anleitung (Deutsch)

## Description
Das Projekt benötigt eine klare Anleitung, wie man es in eine lauffähige Website verwandeln kann. Die Build-Dokumentation soll sowohl für lokale Entwicklung als auch für Production-Deployment funktionieren.

## Tasks
- [ ] `README.md` erstellen oder aktualisieren mit:
  - [ ] Projekt-Beschreibung
  - [ ] Voraussetzungen (Node.js Version, etc.)
  - [ ] Installation: `npm install` (oder entsprechender Befehl)
  - [ ] Lokale Entwicklung: `npm run dev` (oder entsprechender Befehl)
  - [ ] Production Build: `npm run build` (oder entsprechender Befehl)
  - [ ] Build-Output-Verzeichnis dokumentieren (z.B. `dist/`, `build/`)
- [ ] Build-Prozess einrichten falls noch nicht vorhanden
- [ ] Sicherstellen, dass der Build-Prozess funktioniert
- [ ] `.gitignore` aktualisieren für Build-Artefakte
- [ ] Deployment-Anleitung hinzufügen

## Beispiel README-Struktur
```markdown
# Projektname

## Installation
npm install

## Lokale Entwicklung
npm run dev

## Production Build
npm run build

Das Build-Ergebnis befindet sich im `dist/` Verzeichnis.

## Deployment
[Anleitung für GitHub Pages oder anderen Host]
```

## Acceptance Criteria
- README.md existiert mit vollständiger Dokumentation
- Build-Befehle sind dokumentiert und funktionieren
- Das Projekt kann von jedem mit den dokumentierten Befehlen gebaut werden
- Build-Ausgabe ist deployment-ready (nicht nur lokal lauffähig)

---

# Issue 3: GitHub Pages Deployment Setup

## Title
Configure and deploy website to GitHub Pages

## Description
Set up automated deployment to GitHub Pages so the website is publicly accessible. This should be done after code cleanup is complete.

## Tasks
- [ ] Create `.github/workflows/deploy.yml` for GitHub Actions
- [ ] Configure build process for GitHub Pages deployment
- [ ] Set correct base path if repository is not at root (e.g., `/repository-name/`)
- [ ] Update any absolute paths to work with GitHub Pages URL structure
- [ ] Enable GitHub Pages in repository settings
- [ ] Set up automatic deployment on push to main branch
- [ ] Test deployment and verify all links/resources load correctly
- [ ] Update README.md with live site URL

## GitHub Actions Workflow Template
The workflow should:
- Trigger on push to main branch
- Run `npm install && npm run build`
- Deploy the build output to GitHub Pages
- Use appropriate Node.js version

## Acceptance Criteria
- GitHub Actions workflow successfully builds the project
- Website is accessible via GitHub Pages URL
- All assets (images, CSS, JS) load correctly
- No 404 errors on deployed site
- Deployment happens automatically on push to main
- Live URL is documented in README.md

## Notes
- Depends on Issue #1 (code cleanup) and Issue #2 (build process)
- Make sure to update repository settings to enable GitHub Pages
- Consider using `gh-pages` branch or GitHub Actions deployment