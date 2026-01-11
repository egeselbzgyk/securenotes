# 10. Lokale Ausführung der Anwendung

## Voraussetzungen

### Software-Anforderungen

| Software | Version | Installation |
|----------|---------|---------------|
| Docker | 20.10+ | [Docker Desktop](https://www.docker.com/products/docker-desktop) |
| Docker Compose | 2.0+ | Inklusive in Docker Desktop |
| Git | Beliebig | [Git](https://git-scm.com/downloads) |
| Node.js | 20+ (nur für Entwicklung ohne Docker) | [Node.js](https://nodejs.org/) |

### System-Anforderungen

- **Betriebssystem:** Windows 10/11, macOS, Linux
- **RAM:** Mindestens 4 GB (empfohlen 8 GB)
- **Speicher:** Mindestens 2 GB freier Speicherplatz
- **Prozessor:** x64 oder ARM64

## Schritt-für-Schritt-Anleitung

### 1. Repository Klonen

```bash
# Git Repository klonen
git clone https://github.com/[your-org]/securenotes.git

# In Verzeichnis wechseln
cd securenotes

# Branch prüfen (optional)
git branch
```

### 2. .env Datei erstellen

```bash
# Kopiere die .env.example Datei
cp .env.example .env

# Optional: Bearbeite die Datei mit einem Editor

# Windows (PowerShell)
notepad .env

# Windows (VS Code)
code .env

# Linux/Mac
nano .env
# oder
vim .env
```

### 3. Umgebung konfigurieren

#### Minimale Konfiguration für lokale Entwicklung

```bash
# Meistens funktioniert dies out-of-the-box:
PORT=3000
NODE_ENV=development
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=securenotes
DATABASE_URL=postgresql://postgres:postgres@postgresql:5432/securenotes?schema=local
JWT_SECRET=development_secret_min_32_chars
FRONTEND_URL=http://localhost:5173
FRONTEND_BASE_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_SECURE=false
MAIL_FROM=noreply@localhost
MAIL_ENABLED=true
```

#### Google OAuth (optional)

Wenn du Google OAuth nutzen möchtest:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/login/google/callback
```

**Hinweis:** OAuth ist für lokale Entwicklung optional. Du kannst auch mit E-Mail/Passwort arbeiten.

### 4. Anwendung starten

#### Alle Services starten

```bash
# Starte alle Services (Postgres, Mailpit, Backend, Frontend)
docker-compose up --build

# Oder im Hintergrund laufen lassen
docker-compose up --build -d
```

#### Build-Prozess

Docker führt folgende Schritte aus:

1. **PostgreSQL Image pullen:** `postgres:alpine`
2. **Mailpit Image pullen:** `axllent/mailpit:latest`
3. **Backend builden:**
   - Node.js Dependencies installieren
   - Prisma Client generieren
   - TypeScript zu JavaScript kompilieren
4. **Frontend builden:**
   - Node.js Dependencies installieren
   - Rollup Platform-Specific Dependency
   - Vite Build (static Assets)
5. **Prisma Migrationen ausführen:** `npx prisma migrate deploy`
6. **Alle Services starten:**
   - PostgreSQL (Datenbank)
   - Mailpit (SMTP Test)
   - Backend (Express.js)
   - Frontend (Nginx)

#### Logs überwachen

```bash
# Alle Logs in Echtzeit anzeigen
docker-compose up --build

# Logs im Hintergrund:
docker-compose logs -f
```

### 5. Zugriff auf Anwendungen

#### Frontend (Nginx)

```
URL: http://localhost
```

Öffne im Browser: http://localhost

#### Backend API

```
URL: http://localhost:3000
Health Check: http://localhost:3000/
```

**API-Endpunkte:**
- `POST /auth/login` - Login
- `POST /auth/register` - Registrierung
- `GET /notes/` - Notizen auflisten
- `POST /notes/` - Notiz erstellen
- `GET /notes/search` - Suchen

#### Mailpit Web UI

```
URL: http://localhost:8025
```

**Funktionen:**
- E-Mails einsehen (Verifikation, Passwort-Reset)
- E-Mail-Content anzeigen
- Links anklicken

#### PostgreSQL

```
Host: localhost
Port: 5432
User: postgres
Password: postgres
DB: securenotes
```

**Verbindung mit psql:**
```bash
# Im PostgreSQL Container
docker exec -it securenotes-db psql -U postgres -d securenotes

# Oder von Host (wenn Port gemappt)
psql -h localhost -p 5432 -U postgres -d securenotes
```

### 6. Erste Nutzung

#### Registrierung

1. Öffne http://localhost
2. Klicke auf "Registrieren"
3. Gib E-Mail und Passwort ein
4. Sende Formular ab

#### E-Mail Verifikation

1. Öffne http://localhost:8025 (Mailpit)
2. Suche nach Verifikations-E-Mail
3. Klicke auf Verifizierungs-Link
4. Du wirst zur Login-Seite weitergeleitet

#### Login

1. Gib E-Mail und Passwort ein
2. Klicke auf "Anmelden"
3. Du wirst zum Dashboard weitergeleitet

#### Erste Notiz erstellen

1. Klicke auf "Neue Notiz"
2. Gib Titel und Inhalt ein (Markdown)
3. Wähle Sichtbarkeit (PRIVATE/PUBLIC)
4. Speichere die Notiz

## Typische Fehlerquellen

### 1. Port-Konflikte

#### Problem
```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Ursache
Port wird bereits von einem anderen Prozess verwendet.

#### Lösung

**Windows (PowerShell):**
```powershell
# Prozess auf Port 3000 finden
netstat -ano | findstr :3000

# Beende den Prozess (ersetze PID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Prozess auf Port 3000 finden
lsof -i :3000

# Beende den Prozess (ersetze PID)
kill -9 <PID>
```

**Alternative:** Ändere PORT in `.env`:
```bash
PORT=3001
```

### 2. .env Datei fehlt

#### Problem
```
Error: DATABASE_URL is missing
```

#### Ursache
`.env` Datei wurde nicht erstellt oder ist falsch benannt.

#### Lösung

```bash
# Prüfe ob .env existiert
ls -la .env

# Erstelle aus .env.example
cp .env.example .env
```

### 3. Docker-Netzwerk-Probleme

#### Problem
Container können nicht miteinander kommunizieren.

#### Lösung

```bash
# Stoppe und entferne alle Container
docker-compose down

# Entferne Docker-Netzwerke
docker network prune

# Starte neu
docker-compose up --build
```

### 4. Mailpit nicht erreichbar

#### Problem
E-Mail-Verifikation funktioniert nicht, Mailpit antwortet nicht.

#### Lösung

```bash
# Prüfe ob Mailpit läuft
docker ps | grep securenotes-mailpit

# Prüfe Logs
docker logs securenotes-mailpit

# Prüfe Port-Mappping
docker port securenotes-mailpit

# Erwartet: 1025/tcp, 8025/tcp
```

**Stelle sicher, dass in `.env`:**
```bash
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_SECURE=false
MAIL_ENABLED=true
```

### 5. Browser-Cache

#### Problem
Nach Code-Änderungen keine Updates sichtbar.

#### Lösung

```bash
# Container neu bauen
docker-compose up --build --force-recreate

# Browser Hard Refresh
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

### 6. PostgreSQL-Verbindungsprobleme

#### Problem
Backend kann nicht auf Datenbank zugreifen.

#### Lösung

```bash
# Prüfe ob DB läuft
docker ps | grep securenotes-db

# Prüfe Logs
docker logs securenotes-db

# Prüfe Connection String in .env
cat .env | grep DATABASE_URL

# Expected: postgresql://postgres:postgres@postgresql:5432/securenotes?schema=local
#          ^^^^^^^^^^       ^^^^^^^^^^           ^^^^^^^^^^^^^^^^^^
#          User            Password               Container-Name
```

```bash
# Restart DB
docker-compose restart postgresql

# Kompletter Neustart
docker-compose down
docker-compose up --build
```

### 7. Build-Fehler

#### Problem
Build schlägt mit TypeScript- oder Dependency-Fehlern fehl.

#### Lösung

```bash
# Cache leeren
docker-compose down
docker system prune -a

# Neu bauen
docker-compose up --build --no-cache
```

## Entwicklung ohne Docker (Alternative)

Wenn Docker nicht verfügbar ist, kannst du auch ohne Docker entwickeln.

### Backend lokal starten

```bash
# Backend-Verzeichnis
cd backend

# Dependencies installieren
npm install

# Prisma Client generieren
npx prisma generate

# Prisma Migrationen
npx prisma migrate dev

# Entwicklungsserver starten
npm run dev
```

**Voraussetzung:** PostgreSQL muss separat laufen und DATABASE_URL konfiguriert sein.

### Frontend lokal starten

```bash
# Frontend-Verzeichnis
cd frontend

# Dependencies installieren
npm install

# Vite Dev Server starten
npm run dev
```

**Zugriff:** http://localhost:5173

### Voraussetzungen ohne Docker

- **PostgreSQL:** Muss lokal installiert sein
- **Node.js:** Version 20+
- **npm:** Node Package Manager

## Service-Management

### Container stoppen

```bash
# Alle Container stoppen
docker-compose stop

# Spezifischen Container stoppen
docker-compose stop backend
```

### Container starten

```bash
# Alle Container starten
docker-compose start

# Spezifischen Container starten
docker-compose start backend
```

### Container neu starten

```bash
# Alle Container neu starten
docker-compose restart

# Spezifischen Container neu starten
docker-compose restart backend
```

### Logs anzeigen

```bash
# Alle Logs
docker-compose logs

# Logs eines Services
docker-compose logs backend

# Logs in Echtzeit
docker-compose logs -f backend
```

### Container entfernen

```bash
# Alle Container stoppen und entfernen
docker-compose down

# Auch Volumes entfernen (Daten werden gelöscht!)
docker-compose down -v
```

## Nächste Schritte

- [Einsatz von KI](11-ki-einsatz.md) - KI-gestützte Entwicklung
