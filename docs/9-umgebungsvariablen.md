# 9. Umgebungsvariablen

## 9.1 .env.example Datei

```bash
# ============================================
# APPLICATION
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# DATABASE
# ============================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=securenotes
DATABASE_URL=postgresql://postgres:your_secure_password_here@postgresql:5432/securenotes?schema=public

# ============================================
# JWT & SECURITY
# ============================================
JWT_SECRET=your_jwt_secret_minimum_32_characters_long

# ============================================
# CORS & FRONTEND
# ============================================
FRONTEND_URL=http://localhost:5173
FRONTEND_BASE_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost

# ============================================
# EMAIL (MAILPIT FOR DEVELOPMENT)
# ============================================
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_SECURE=false
MAIL_FROM=noreply@securenotes.example
MAIL_ENABLED=true

# ============================================
# GOOGLE OAUTH (OPTIONAL)
# ============================================
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/login/google/callback

# ============================================
# DOCKER COMPOSE PORTS (OPTIONAL)
# ============================================
SMTP_PORT=1025
WEB_UI_PORT=8025
```

## 9.2 Erklärung der Variablen

### Application

| Variable   | Beschreibung                              | Sicherheitsrelevanz | Konfiguration                          |
| ---------- | ----------------------------------------- | ------------------- | -------------------------------------- |
| `PORT`     | Backend-Listen-Port                       | Niedrig             | Default: 3000, in Prod hinter Firewall |
| `NODE_ENV` | Environment-Mode (development/production) | Mittel              | `production` aktiviert Secure-Cookies  |

**Beispiel-Konfiguration:**

```bash
# Entwicklung
PORT=3000
NODE_ENV=development

# Produktion
PORT=3000
NODE_ENV=production
```

### Database

| Variable            | Beschreibung           | Sicherheitsrelevanz | Konfiguration                          |
| ------------------- | ---------------------- | ------------------- | -------------------------------------- |
| `POSTGRES_USER`     | Datenbank-Benutzername | Hoch                | Nur in .env, niemals committen         |
| `POSTGRES_PASSWORD` | Datenbank-Passwort     | Kritisch            | Mindestens 32 Zeichen, Sonderzeichen   |
| `POSTGRES_DB`       | Datenbank-Name         | Niedrig             | Kann offen sein                        |
| `DATABASE_URL`      | Connection String      | Kritisch            | Enthält Credentials, niemals committen |

**Sichere Konfiguration:**

```bash
# Strong password example
POSTGRES_PASSWORD=J7x#9Km$pL2@vN8&Qw5!Zr3
```

**Sichere Generierung:**

```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell (Windows)
(New-Guid).Guid.Replace("-","")
```

### JWT & Security

| Variable     | Beschreibung            | Sicherheitsrelevanz | Konfiguration                   |
| ------------ | ----------------------- | ------------------- | ------------------------------- |
| `JWT_SECRET` | Signatur-Secret für JWT | Kritisch            | Mindestens 32 Zeichen, zufällig |

**Warum kritisch:**

- Wird zum Signieren von JWT Access Tokens verwendet
- Wenn kompromittiert, können gefälschte Tokens erstellt werden
- Muss zufällig und lang genug sein, um Brute-Force zu verhindern

**Sichere Generierung:**

```bash
# Linux/Mac
openssl rand -base64 48

# PowerShell (Windows)
-join ((48..57 + 65..90 + 97..122 | Get-Random -Count 48 | % {[char]$_}))
```

**NIE:**

```bash
# ❌ Schwaches Secret
JWT_SECRET=secret

# ❌ Kurzes Secret
JWT_SECRET=abc123

# ❌ Im Code
const JWT_SECRET = "my_secret";  # NEIN!
```

### CORS & Frontend

| Variable            | Beschreibung               | Sicherheitsrelevanz | Konfiguration                 |
| ------------------- | -------------------------- | ------------------- | ----------------------------- |
| `FRONTEND_URL`      | Frontend-URL für CORS      | Mittel              | In Prod: https://domain.com   |
| `FRONTEND_BASE_URL` | Base-URL für Redirects     | Mittel              | Wie FRONTEND_URL              |
| `CORS_ORIGINS`      | Whitelist für Origin-Guard | Hoch                | Nur vertrauenswürdige Domains |

**Sichere Konfiguration:**

```bash
# Entwicklung
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost

# Produktion
CORS_ORIGINS=https://securenotes.example.com,https://www.securenotes.example.com
```

**Warum wichtig:**

- Verhindert Cross-Origin-Angriffe
- Stellt sicher, dass nur autorisierte Frontends auf API zugreifen können
- Origin-Guard Middleware prüft Request-Origin gegen Whitelist

### Email

| Variable       | Beschreibung       | Sicherheitsrelevanz | Konfiguration                      |
| -------------- | ------------------ | ------------------- | ---------------------------------- |
| `SMTP_HOST`    | SMTP-Server        | Mittel              | Prod: vertrauenswürdiger Provider  |
| `SMTP_PORT`    | SMTP-Port          | Niedrig             | Standard: 587 (TLS) oder 465 (SSL) |
| `SMTP_SECURE`  | SSL/TLS-Verbindung | Mittel              | Prod: true                         |
| `MAIL_FROM`    | Absender-E-Mail    | Niedrig             | No-Reply-Adresse                   |
| `MAIL_ENABLED` | E-Mail aktiviert   | Niedrig             | false wenn kein SMTP               |

**Produktions-Konfiguration:**

```bash
# Example für SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
MAIL_FROM=noreply@yourdomain.com

# Example für AWS SES
SMTP_HOST=email-smtp.eu-central-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=true
MAIL_FROM=noreply@yourdomain.com
```

**Entwicklungs-Konfiguration (Mailpit):**

```bash
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_SECURE=false
MAIL_FROM=noreply@localhost
```

### Google OAuth (optional)

| Variable               | Beschreibung        | Sicherheitsrelevanz | Konfiguration                         |
| ---------------------- | ------------------- | ------------------- | ------------------------------------- |
| `GOOGLE_CLIENT_ID`     | OAuth Client ID     | Mittel              | Aus Google Cloud Console              |
| `GOOGLE_CLIENT_SECRET` | OAuth Secret        | Kritisch            | Nie committen                         |
| `GOOGLE_REDIRECT_URI`  | Redirect nach Login | Mittel              | Muss mit Google-Config übereinstimmen |

**Google Cloud Console Setup:**

1. Erstelle neues OAuth 2.0 Client
2. Anwendungstyp: Web-Anwendung
3. Authorisierte JavaScript-Ursprünge: `http://localhost:5173` (Entwicklung) oder `https://yourdomain.com` (Produktion)
4. Authorisierte Redirect-URIs: `http://localhost:3000/auth/login/google/callback`

**Wichtig:** Redirect-URI muss exakt mit Konfiguration übereinstimmen.

## Nächste Schritte

- [Lokale Ausführung](10-lokale-ausfuehrung.md) - Installations- und Start-Anleitung
