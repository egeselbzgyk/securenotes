# 8. Docker & Deployment

## Dockerfile-Erklärung

### Backend Dockerfile

**Datei:** `backend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Erklärung

1. **Base Image:** `node:20-alpine`
   - Minimaler Linux-Container (Alpine)
   - Reduzierte Angriffsfläche vs. vollständige Node.js-Images

2. **Working Directory:** `/app`
   - Konsistenter Pfad für alle Container-Befehle

3. **Dependency Installation:**
   ```dockerfile
   COPY package*.json ./
   RUN npm ci --ignore-scripts
   ```
   - Zuerst nur `package.json` kopieren (Docker Layer Caching)
   - `npm ci`: Installiert exakte Versionen aus lock-file
   - `--ignore-scripts`: Verhindert Ausführung von Scripts (Security-Maßnahme)

4. **Prisma Setup:**
   ```dockerfile
   COPY prisma ./prisma
   COPY prisma.config.ts ./
   RUN npm ci
   ```
   - Prisma-Schema und Konfiguration kopieren
   - Zweites `npm ci` zur Installation von Prisma-Dependencies

5. **Application Copy:**
   ```dockerfile
   COPY . .
   ```
   - Kopiert restlichen Anwendungscode
   - Ausgenutzt Docker Layer Caching (unveränderte Schichten werden gecacht)

6. **Prisma Client Generation:**
   ```dockerfile
   RUN npx prisma generate
   ```
   - Generiert TypeScript-Client für Datenbank-Zugriff

7. **Build:**
   ```dockerfile
   RUN npm run build
   ```
   - Kompiliert TypeScript zu JavaScript (`dist/`-Ordner)

8. **Runtime-Port:**
   ```dockerfile
   EXPOSE 3000
   ```
   - Dokumentiert, dass Container Port 3000 nutzt
   - (Nicht automatisches Publish)

9. **Start-Command:**
   ```dockerfile
   CMD ["npm", "start"]
   ```
   - Startet Produktions-Server (`node dist/src/index.js`)

### Frontend Dockerfile (Multi-Stage)

**Datei:** `frontend/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install --prefer-offline --no-audit

RUN npm install @rollup/rollup-linux-x64-musl --no-save --no-audit

COPY . .

RUN npm run build

# Stage 2: Serve (Nginx)
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Stage 1: Builder

1. **Base Image:** `node:20-alpine as builder`
   - Temporärer Container für Build-Prozess
   - Wird nicht im finalen Image enthalten

2. **Dependency Installation:**
   ```dockerfile
   RUN npm install --prefer-offline --no-audit
   ```
   - `--prefer-offline`: Nutzt lokalen Cache
   - `--no-audit`: Keine Audit-Berichte (Build-Speed)

3. **Rollup Platform-Specific Dependency:**
   ```dockerfile
   RUN npm install @rollup/rollup-linux-x64-musl --no-save --no-audit --prefer-offline
   ```
   - Speziell für Alpine Linux (musl libc vs. glibc)
   - Erforderlich für korrekte Vite-Builds

4. **Build:**
   ```dockerfile
   RUN npm run build
   ```
   - Vite generiert statische Assets in `dist/`

#### Stage 2: Nginx

1. **Base Image:** `nginx:alpine`
   - Minimaler Webserver-Container
   - Keine Node.js-Runtime erforderlich

2. **Nginx Configuration:**
   ```dockerfile
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   ```
   - Kopiert Custom Nginx-Konfiguration

3. **Static Files:**
   ```dockerfile
   COPY --from=builder /app/dist /usr/share/nginx/html
   ```
   - Kopiert `dist/` aus Builder-Stage
   - `--from=builder`: Nutzt Dateien aus vorheriger Stage

4. **Runtime-Port:**
   ```dockerfile
   EXPOSE 80
   ```
   - HTTP-Standard-Port

5. **Start-Command:**
   ```dockerfile
   CMD ["nginx", "-g", "daemon off;"]
   ```
   - Startet Nginx im Vordergrund (Docker-konform)

## Sicherheitsaspekte der Images

### Base Images

**Backend:**
- `node:20-alpine`
- Vorteile: Kleines Image (~50 MB), reduzierte Angriffsfläche
- Nachteil: musl libc vs. glibc (glibc-kompatibler)

**Frontend:**
- `node:20-alpine` (Builder-Stage)
- `nginx:alpine` (Runtime-Stage)
- Vorteile: Minimaler Runtime-Container (~10 MB)

### Best Practices

#### 1. Multi-Stage Builds

**Vorteil:** Runtime-Image enthält keine Build-Tools

```dockerfile
# Builder-Stage hat Compiler, Dependencies, etc.
FROM node:20-alpine as builder
RUN npm install
RUN npm run build

# Runtime-Stage hat nur statische Files und Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

#### 2. Minimal Layers

**Docker Layer Caching:**
```dockerfile
# Unverändertes: Wird gecacht
COPY package*.json ./
RUN npm ci

# Verändert bei Code-Change: Wird neu gebaut
COPY . .
RUN npm run build
```

#### 3. No Scripts

```dockerfile
RUN npm ci --ignore-scripts
```

**Security:** Verhindert Ausführung von bösartigen Scripts in `node_modules`

#### 4. No Secrets in Images

```dockerfile
# ❌ Schlecht
COPY .env ./

# ✅ Gut
ENV DATABASE_URL=${DATABASE_URL}
```

**Security:** Secrets nur via Environment-Variablen

### Offene Sicherheitsverbesserungen

#### 1. Non-Root User

**Aktuell:** Container läuft als `root`

**Empfehlung:**
```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

CMD ["npm", "start"]
```

#### 2. Read-only Filesystem

**Aktuell:** Filesystem ist beschreibbar

**Empfehlung:**
```yaml
# docker-compose.yml
services:
  backend:
    read_only: true
    tmpfs:
      - /tmp
```

#### 3. Image Scanning

**Aktuell:** Kein Image-Scanning

**Empfehlung:**
```bash
# Lokal
trivy image securenotes-backend:latest

# CI/CD Integration
- name: Trivy Scan
  uses: aquasecurity/trivy-action@master
```

#### 4. Image Signing

**Aktuell:** Keine Image-Signatur-Verifikation

**Empfehlung:**
```bash
# Image signieren
docker trust sign securenotes-backend:latest

# Image verifizieren
docker trust verify securenotes-backend:latest
```

## Docker Compose Struktur

### Vollständige Konfiguration

**Datei:** `docker-compose.yml`

```yaml
services:
  postgresql:
    image: postgres:alpine
    container_name: securenotes-db
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mailpit:
    image: axllent/mailpit:latest
    container_name: securenotes-mailpit
    ports:
      - "${SMTP_PORT:-1025}:1025"
      - "${WEB_UI_PORT:-8025}:8025"

  backend:
    build: ./backend
    container_name: securenotes-backend
    ports:
      - "${PORT}:${PORT}"
    depends_on:
      - postgresql
      - mailpit
    env_file:
      - .env
      - ./backend/.env
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgresql:5432/${POSTGRES_DB}?schema=public
      PORT: ${PORT}
      FRONTEND_URL: ${FRONTEND_URL}
      FRONTEND_BASE_URL: ${FRONTEND_BASE_URL}
      SMTP_HOST: mailpit
      SMTP_PORT: 1025
      SMTP_SECURE: "false"
      MAIL_FROM: ${MAIL_FROM}
      MAIL_ENABLED: "true"
    command: sh -c "npx prisma migrate deploy && node dist/src/index.js"

  frontend:
    build: ./frontend
    container_name: securenotes-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Service-Beschreibung

#### PostgreSQL Service

```yaml
postgresql:
  image: postgres:alpine
  container_name: securenotes-db
  environment:
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: ${POSTGRES_DB}
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

- **Image:** `postgres:alpine` (Minimal)
- **Environment:** DB-Credentials via .env
- **Ports:** 5432 → Host (nur für Entwicklung!)
- **Volumes:** Persistente Daten (`postgres_data`)

#### Mailpit Service

```yaml
mailpit:
  image: axllent/mailpit:latest
  container_name: securenotes-mailpit
  ports:
    - "${SMTP_PORT:-1025}:1025"
    - "${WEB_UI_PORT:-8025}:8025"
```

- **Image:** `axllent/mailpit:latest`
- **Ports:**
  - 1025: SMTP-Server
  - 8025: Web UI

**Web UI Access:** http://localhost:8025

#### Backend Service

```yaml
backend:
  build: ./backend
  container_name: securenotes-backend
  ports:
    - "${PORT}:${PORT}"
  depends_on:
    - postgresql
    - mailpit
  env_file:
    - .env
    - ./backend/.env
  environment:
    DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgresql:5432/${POSTGRES_DB}?schema=public
    PORT: ${PORT}
    FRONTEND_URL: ${FRONTEND_URL}
    FRONTEND_BASE_URL: ${FRONTEND_BASE_URL}
    SMTP_HOST: mailpit
    SMTP_PORT: 1025
    SMTP_SECURE: "false"
    MAIL_FROM: ${MAIL_FROM}
    MAIL_ENABLED: "true"
  command: sh -c "npx prisma migrate deploy && node dist/src/index.js"
```

- **Build:** Aus `./backend`-Verzeichnis
- **Ports:** ${PORT} → Host (Default: 3000)
- **Dependencies:** Wartet auf postgresql und mailpit
- **Env Files:** Lädt .env und ./backend/.env
- **Command:** Migrationen + Start

#### Frontend Service

```yaml
frontend:
  build: ./frontend
  container_name: securenotes-frontend
  ports:
    - "80:80"
  depends_on:
    - backend
```

- **Build:** Multi-Stage Build aus `./frontend`
- **Ports:** 80 → Host
- **Dependencies:** Backend muss laufen

### Volumes

```yaml
volumes:
  postgres_data:
```

- **Purpose:** Persistente Datenbank-Daten
- **Lifecycle:** Überlebt Container-Neustarts
- **Backup:** Kann extern gesichert werden

## Netzwerk- und Port-Konfiguration

### Standard-Ports

| Service | Container-Port | Host-Port | Beschreibung |
|---------|---------------|------------|-------------|
| Frontend (Nginx) | 80 | 80 | HTTP-Access |
| Backend (Express) | 3000 | 3000 | API-Access |
| PostgreSQL | 5432 | 5432 | DB-Access (Entwicklung) |
| Mailpit SMTP | 1025 | 1025 | SMTP-Server |
| Mailpit Web UI | 8025 | 8025 | Web-Interface |

### Docker-Netzwerk

```yaml
# Implizites Standard-Netzwerk
docker-compose up

# Erstellt: securenotes_default network
```

#### Container-Kommunikation

**Backend → PostgreSQL:**
```typescript
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgresql:5432/${POSTGRES_DB}
#                                                            ^^^^^^^^^^^^
#                                                            Container-Name
```

**Backend → Mailpit:**
```typescript
SMTP_HOST=mailpit
#          ^^^^^^^^^^^
#          Container-Name
```

**Frontend → Backend:**
```bash
# Via Host-Port-Mapping
http://localhost:3000

# Oder via Docker-Netzwerk (empfohlen)
http://backend:3000
```

### Sicherheitsverbesserungen

#### 1. PostgreSQL-Port nicht exponieren

**Aktuell:** Port 5432 ist offen

**Empfehlung:**
```yaml
postgresql:
  image: postgres:alpine
  # ports:
  #   - "5432:5432"  # Entferne oder kommentiere aus
```

**Alternative für lokale Entwicklung:**
```yaml
postgresql:
  ports:
    - "127.0.0.1:5432:5432"  # Nur localhost
```

#### 2. User-defined Network

**Aktuell:** Standard-Bridge-Netzwerk

**Empfehlung:**
```yaml
networks:
  securenotes-net:
    driver: bridge

services:
  postgresql:
    networks:
      - securenotes-net
  
  backend:
    networks:
      - securenotes-net
  
  frontend:
    networks:
      - securenotes-net
```

#### 3. Health Checks

**Aktuell:** Keine Health Checks

**Empfehlung:**
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Nächste Schritte

- [Umgebungsvariablen](9-umgebungsvariablen.md) - Konfigurations-Referenz
