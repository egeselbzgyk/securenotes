# 3. Verwendete Technologien

## Übersicht

SecureNotes nutzt ein modernes Full-Stack-Technology-Stack mit Fokus auf Security, Performance und Developer Experience.

## Frontend

### React 19.2.3 + TypeScript

#### Warum gewählt
React ist die etablierteste UI-Bibliothek mit einem großen Ökosystem. TypeScript ermöglicht statische Typisierung zur Laufzeit-Fehlervermeidung und verbessert die Code-Qualität.

#### Sicherheitsrelevante Eigenschaften
- Statische Typisierung verhindert viele Fehler zur Kompilierzeit
- Virtual DOM für performante Rendering
- Component-basierte Architektur für Wiederverwendbarkeit
- JSX escaping (standardmäßig) schützt vor XSS

#### Bekannte Risiken und Adressierung
- **Risiko:** Reacts `dangerouslySetInnerHTML` kann XSS ermöglichen
- **Adressierung:** Nur verwendet mit vertrauenswürdigem, gesanitized HTML
- **Risiko:** Große Bundle-Größen bei schlechtem Tree-Shaking
- **Adressierung:** Vite-Build-Optimierung und Code-Splitting

### Vite 6.2.0

#### Warum gewählt
Schnellerer Build- und Entwicklungsserver als webpack mit optimierter Hot Module Replacement (HMR).

#### Sicherheitsrelevante Eigenschaften
- Nutzt ES Modules für bessere Tree-Shaking-Effizienz
- Schnelle Cold Starts und schnelles HMR

### Tailwind CSS 3.4.17

#### Warum gewählt
Utility-First-CSS-Framework für schnelle UI-Entwicklung mit konsistentem Design.

#### Risiken & Adressierung
- **Risiko:** Größere CSS-Bundle-Größe in kleinen Anwendungen
- **Adressierung:** Durch Purging während des Build-Prozesses minimiert

## Backend

### Express.js 5.2.1 + TypeScript

#### Warum gewählt
Minimalistisches, bewährtes Node.js-Framework mit flexibler Middleware-Architektur.

#### Sicherheitsrelevante Eigenschaften
- Ermöglicht granulare Sicherheitsmiddleware (Helmet, CORS, Rate-Limiting)
- JSON Body Parsing mit Limits (10kb)
- Request-Header-Sanitization

### Node.js 20 (Alpine Linux)

#### Warum gewählt
LTS-Version mit stabiler Laufzeitumgebung. Alpine-Basis reduziert Image-Größe und Angriffsfläche.

#### Risiken & Adressierung
- **Risiko:** Bekannte Sicherheitslücken in älteren Node-Versionen
- **Adressierung:** Durch Nutzung von LTS-Patches und regelmäßige Dependency-Updates

## Datenbank

### PostgreSQL

#### Warum gewählt
Relationales Datenbanksystem mit starkem SQL-Support und ACID-Garantien.

#### Sicherheitsrelevante Eigenschaften
- Row-Level Security (RLS)-Unterstützung
- Robuste Authentifizierung und Autorisierung
- Verschlüsselte Verbindungen möglich (TLS)

#### Bekannte Risiken und Adressierung
- **Risiko:** SQL-Injection bei unsicherer Query-Implementierung
- **Adressierung:** Durch Prisma ORM (parametrisierte Queries) vollständig adressiert

### Prisma ORM 7.2.0

#### Warum gewählt
TypeScript-First ORM mit Migrationen, Type-Safety und automatischem Client-Generation.

#### Sicherheitsrelevante Eigenschaften
- Automatische Parametrisierung gegen SQL-Injection
- Schema-Validierung zur Laufzeit
- Type-safe Database Queries

## Security-Bibliotheken

### Helmet 8.1.0

#### Warum gewählt
Setzt sicherheitsrelevante HTTP-Header automatisch.

#### Sicherheitsrelevante Eigenschaften
- Content Security Policy (CSP)
- X-Frame-Options (Clickjacking-Schutz)
- X-Content-Type-Options (MIME-Type-Sniffing verhindern)
- Strict-Transport-Security (HSTS)
- X-XSS-Protection (Legacy Browser)

### Argon2 0.44.0

#### Warum gewählt
Gewinner des Password Hashing Competition 2015, resistenter gegen GPU/ASIC-Brute-Force.

#### Parameter
- **Algorithm:** Argon2id (Memory-Hard)
- **Memory Cost:** 19456 (~19 MB RAM pro Hash)
- **Time Cost:** 2 (Iterationen)
- **Parallelism:** 1 (Threads)

```typescript
argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
});
```

#### Bekannte Risiken und Adressierung
- **Risiko:** Falsche Parameter können zu schwachen Hashes führen
- **Adressierung:** Parameter basierend auf NIST-Empfehlungen gewählt

### zxcvbn 4.4.2

#### Warum gewählt
Echtzeit-Passwortstärke-Evaluation statt statischer Regeln.

#### Sicherheitsrelevante Eigenschaften
- Berücksichtigt Entropie und Wörterbücher
- Erkennt Benutzer-Inputs (E-Mail, Name) im Passwort
- Erkennt Tastatur-Muster und häufige Passwörter

### sanitize-html 2.17.0

#### Warum gewählt
HTML-Sanitization-Bibliothek zur XSS-Prävention mit Whitelist-Ansatz.

#### Sicherheitsrelevante Eigenschaften
- Whitelist-basierte Tag- und Attribut-Filterung
- Entfernung von Skript-Tags und Event-Handlern
- Sichere iframe-Whitelist für YouTube

### jose 6.1.3

#### Warum gewählt
Moderne JWT-Library mit Support für JWS, JWE, JWK.

#### Sicherheitsrelevante Eigenschaften
- Korrekte Implementierung von Signatur-Verifikation
- Support für HS256 (HMAC with SHA-256)

### express-rate-limit 8.2.1

#### Warum gewählt
Schutz vor Brute-Force- und DoS-Angriffen.

#### Konfiguration
- **Global:** 100 Requests / 15 Minuten
- **Auth-Endpunkte:** 10 Requests / 60 Sekunden

## Authentifizierung

### google-auth-library 10.5.0

#### Warum gewählt
Offizielle Google-Bibliothek für OAuth2-Flow.

#### Sicherheitsrelevante Eigenschaften
- Token-Verifikation mit RS256
- PKCE (Proof Key for Code Exchange) Support

### nodemailer 7.0.12

#### Warum gewählt
Node.js-Mailer mit Provider-Support.

#### Bekannte Risiken und Adressierung
- **Risiko:** Offenlegung von SMTP-Credentials
- **Adressierung:** Durch Environment-Variablen und Mailpit (Test) isoliert

## Testing

### Jest 30.2.0 (Backend)

#### Warum gewählt
Bewährtes Test-Framework mit Mocking- und Snapshot-Support.

### Vitest 4.0.16 (Frontend)

#### Warum gewählt
Jest-kompatibel, schneller für Vite-Projekte.

## CI/CD

### GitHub Actions

#### Verwendeter Workflow
`.github/workflows/verify.yml` - Ausgelöst bei Pull Requests auf `main`-Branch

#### Security-Steps
- Gitleaks Secret Scanning
- npm audit (high severity)
- Dependency Updates
- Automatische Tests

## Docker

### Docker Compose

#### Warum gewählt
Orchestrierung von Datenbank, Mail-Dienst, Backend und Frontend.

#### Services
- PostgreSQL (Datenbank)
- Mailpit (SMTP Test-Service)
- Backend (Express.js)
- Frontend (Nginx)

## Nächste Schritte

- [Architekturübersicht](4-architektur.md) - Detaillierte Systemarchitektur
- [Sicherheitskonzept](5-sicherheitskonzept.md) - Comprehensive Security-Analyse
