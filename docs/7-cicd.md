# 7. CI/CD & DevSecOps

## Verwendeter Workflow

### GitHub Actions Pipeline

**Datei:** `.github/workflows/verify.yml`
**Trigger:** Pull Requests auf `main`-Branch

```yaml
name: Code Quality & Security Check

on:
  pull_request:
    branches:
      - "main"

jobs:
  quality-check:
    runs-on: ubuntu-latest
```

### Workflow-Struktur

```
┌─────────────────────────────────────────┐
│  Pull Request auf main-Branch         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  GitHub Actions Workflow starten    │
└─────────────────┬───────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼──────┐ ┌──▼────────┐ ┌─▼─────────┐
│ Secret   │ │ Dependency│ │ Lint &    │
│ Scanning │ │ Audit     │ │ Type Check │
│ (Gitleaks)│ │ (npm audit)│ │           │
└───┬──────┘ └──┬────────┘ └─┬─────────┘
    │            │             │
    └────────────┴─────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Backend & Frontend Tests        │
│  (Jest & Vitest)               │
└───────────────────────────────────┘
```

### Services in Pipeline

```yaml
services:
  postgres:
    image: postgres:16
    ports:
      - 5432:5432
    env:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: test_db
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

PostgreSQL wird als Container für Test-Zwecke gestartet.

## Dependency Updates

### NPM CI

```bash
npm ci  # Installiert exakte Dependencies aus package-lock.json
```

**Vorteile:**

- Reproduzierbare Builds
- Schneller als `npm install`
- Verwendet lock-file für exakte Versionen

### Overrides

```json
// package.json
"overrides": {
  "cross-spawn": "^7.0.5",
  "glob": "^11.1.0",
  "rollup": "^4.0.0"
}
```

**Zweck:** Erzwingt minimale Versionen für kritische Packages mit bekannten Vulnerabilities.

### Frontend-Spezifisch

```yaml
- name: Frontend Install
  working-directory: ./frontend
  run: |
    npm ci
    npm install @rollup/rollup-linux-x64-gnu --no-save --no-audit --prefer-offline
```

**@rollup/rollup-linux-x64-gnu:** Speziell für Alpine-Build (glibc vs. musl Problem).

## Vulnerability Scanning

### 1. Secret Scanning (Gitleaks)

```yaml
- name: Gitleaks Secret Scan
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Was wird gescannt:**

- API-Keys
- Database-Passwords
- JWT Secrets
- SMTP-Credentials
- OAuth Client Secrets

**Erkannte Patterns:**

- Base64-encodierte Secrets
- URLs mit Credentials
- API-Keys von gängigen Services
- Private Keys

**Pipeline-Verhalten:**

- Bei gefundenen Secrets: Pipeline bricht ab (fail-fast)
- Pull Request wird blockiert
- Developer muss Secret entfernen und recommit

### 2. Dependency Audit (npm audit)

**Backend:**

```yaml
- name: Backend Security Audit
  working-directory: ./backend
  run: npm audit --audit-level=high
```

**Frontend:**

```yaml
- name: Frontend Security Audit
  working-directory: ./frontend
  run: npm audit --audit-level=high
```

**Audit-Levels:**

- `--audit-level=high`: Nur kritische und high-severity
- `--audit-level=moderate`: Moderate, high, critical
- `--audit-level=low`: Alle severity levels

**Beispiel-Ausgabe:**

```
+─┬─────────────────────────────────────────────────────────────┐
│                       npm audit security                      │
+──────────────────────────────────────────────────────────────┘┼

found 1 high severity vulnerability in node_modules/lodash
  Package       lodash
  Patched in    4.17.21
  Dependency of  backend
  Path          backend > express > lodash
  More info     https://npmjs.com/advisories/1673
```

### 3. Code Quality (ESLint + TypeScript)

**Backend:**

```yaml
- name: Backend Lint & Type Check
  working-directory: ./backend
  run: |
    npx prisma generate
    npm run lint
    npm run typecheck
```

**Frontend:**

```yaml
- name: Frontend Lint & Build
  working-directory: ./frontend
  run: |
    npm run build
```

**Was wird geprüft:**

- ESLint: Code-Style, Best Practices, Anti-Patterns
- TypeScript: Typ-Korrektheit, Missing Types
- Build: Frontend-Compilierbarkeit

## Automatische Tests (Frontend & Backend)

### Backend Tests (Jest)

```yaml
- name: Backend Tests
  working-directory: ./backend
  env:
    DATABASE_URL: "postgresql://test_user:test_password@localhost:5432/test_db?schema=public"
  run: |
    echo "DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_db?schema=public" > .env
    npx prisma generate
    npx prisma db push --accept-data-loss
    npm run test --if-present
```

**Test-Coverage:**

- `auth.service.test.ts`: Passwort-Validierung, Hashing, Auth-Flow
- `security.test.ts`: XSS-Schutz, Rate-Limiting-Konfiguration
- `markdown.test.ts`: Markdown-Parsing, Sanitization
- `notes.service.test.ts`: Notiz-CRUD, Search
- `index.test.ts`: API-Endpunkt-Tests

**Security-Test-Beispiele:**

```typescript
describe("XSS Prevention", () => {
  it("should sanitize script tags", () => {
    const malicious = "<script>alert('xss')</script>";
    const sanitized = sanitizeMarkdown(malicious);
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("alert('xss')");
  });

  it("should sanitize onerror attributes", () => {
    const malicious = '<img src="x" onerror="alert(1)">';
    const sanitized = sanitizeMarkdown(malicious);
    expect(sanitized).not.toContain("onerror");
  });
});

describe("Password Strength Validation", () => {
  it("should reject weak password with low entropy", () => {
    expect(() => {
      passwordService.assertStrong("password123", { userInputs: [] });
    }).toThrow("WEAK_PASSWORD");
  });

  it("should reject password containing email", () => {
    expect(() => {
      passwordService.assertStrong("Example123!", {
        userInputs: ["user@example.com"],
      });
    }).toThrow("WEAK_PASSWORD");
  });
});
```

### Frontend Tests (Vitest)

```yaml
- name: Frontend Tests
  working-directory: ./frontend
  run: npm run test --if-present
```

**Test-Coverage:**

- `api.test.ts`: API-Client Tests, Error-Handling
- `auth-context.test.ts`: Auth-Context, Token-Management
- `router.test.ts`: Routing-Logik, Navigation

**Frontend-Test-Beispiel:**

```typescript
describe("API Client", () => {
  it("should automatically refresh token on 401", async () => {
    // Mock original request with 401
    fetchMock.mockResponseOnce(JSON.stringify({ ok: false }), { status: 401 });

    // Mock refresh endpoint
    fetchMock.mockResponseOnce(
      JSON.stringify({ ok: true, accessToken: "new_token" })
    );

    // Mock second attempt (successful)
    fetchMock.mockResponseOnce(JSON.stringify({ data: "success" }));

    await NotesApi.list();

    // Should have called refresh endpoint
    expect(fetchMock).toHaveBeenCalledWith("/auth/refresh", expect.any(Object));
  });
});
```

## Sicherheitsrelevante Pipeline-Schritte

### 1. Secret Scanning (Gitleaks)

**Purpose:** Verhindert Commit von Secrets ins Repository

**Configuration:**

```yaml
- name: Gitleaks Secret Scan
  uses: gitleaks/gitleaks-action@v2
```

**Detected Secrets:**

- AWS Access Keys
- API-Keys (Stripe, GitHub, etc.)
- Database-Connection Strings
- JWT Secrets
- SMTP-Credentials

**Response:**

- Pipeline bricht bei gefundene Secrets
- Pull Request wird blockiert
- Developer-Benachrichtigung via GitHub

### 2. Dependency Audit (npm audit)

**Purpose:** Verhindert Nutzung von Dependencies mit bekannten CVEs

**Configuration:**

```yaml
run: npm audit --audit-level=high
```

**Severity Levels:**

- **Critical:** Sofortige Gefahr, sofortiger Fix notwendig
- **High:** Hohe Gefahr, baldiger Fix notwendig
- **Moderate:** Mittlere Gefahr, geplanter Fix
- **Low:** Niedrige Gefahr, optionaler Fix

**Pipeline-Verhalten:**

- Bei High/Critical: Pipeline bricht ab
- Automatische Updates: `npm update`
- Manual Updates: Developer entscheidet

### 3. Type Checking

**Purpose:** TypeScript verhindert Type-Errors zur Kompilierzeit

**Configuration:**

```bash
npm run typecheck
# tsc --noEmit
```

**Security-Relevanz:**

- Verhindert untypisierte API-Inputs
- Erkennt fehlende Validierungen
- Stellt sicher, dass Contracts eingehalten werden

### 4. Security Tests

**Purpose:** Explizite Tests für Security-Szenarien

**Test-Bereiche:**

- XSS Prevention (Script-Tags, Event-Handler)
- SQL Injection (Parameterized Queries)
- Password Strength (zxcvbn, Patterns)
- Rate Limiting (Configuration)
- CSRF Protection (Token Validation)

## Pipeline-Metriken

### Current Status

| Schritt                | Status       | Dauer                  |
| ---------------------- | ------------ | ---------------------- |
| Setup Node.js          | ✅           | ~30s                   |
| Secret Scanning        | ✅           | ~20s                   |
| Backend Install        | ✅           | ~45s                   |
| Backend Audit          | ✅           | ~10s                   |
| Backend Lint/TypeCheck | ✅           | ~30s                   |
| Backend Tests          | ✅           | ~60s                   |
| Frontend Install       | ✅           | ~45s                   |
| Frontend Audit         | ✅           | ~10s                   |
| Frontend Lint/Build    | ✅           | ~90s                   |
| Frontend Tests         | ✅           | ~30s                   |
| **Gesamt**       | **✅** | **~6-7 Minuten** |

### Success-Kriterien

- ✅ Alle Tests bestehen (0 failures)
- ✅ Keine Secrets gefunden (Gitleaks)
- ✅ Keine High/Critical Vulnerabilities (npm audit)
- ✅ Keine TypeScript-Errors
- ✅ Keine ESLint-Errors

## Nächste Schritte

- [Docker &amp; Deployment](8-docker.md) - Container-Struktur und Deployment
