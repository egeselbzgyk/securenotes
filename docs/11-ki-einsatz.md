# 11. Einsatz von KI

## Verwendete KI-Tools

Während der Entwicklung des SecureNotes-Projekts wurden folgende KI-Tools eingesetzt:

### 1. GLM-4.7 und Opus

**Typ:** Code-Generierung und Refactoring
**Einsatzzeit:** Kontinuierlich während der gesamten Entwicklung
**Funktionen:**

- Auto-Completion von Code
- Refactoring-Vorschläge
- Debugging-Hilfe
- Dokumentations-Generierung
- Test-Generierung

### 2. ChatGPT und Gemini

**Typ:** Recherche und Dokumentation
**Einsatzzeit:** Bei Bedarf für aktuelle Informationen
**Funktionen:**

- Aktuelle Security-Best Practices
- Dokumentations-Recherche
- Vulnerability-Informationen

## Für welche Aufgaben

### Code-Generierung

#### Initial-Setup

- **Aufgabe:** Projektstruktur erstellen
- **KI-Unterstützung:**
  - Dockerfile-Vorlagen
  - Docker Compose Konfiguration
  - Initial-Express-Setup
  - Prisma-Schema-Entwurf

#### Testing

#### Unit-Tests

- **Aufgabe:** Security-Tests generieren
- **KI-Unterstützung:**
  - Test-Fälle für XSS-Prävention
  - Password-Strength-Tests
  - Rate-Limiting-Tests
  - SQL-Injection-Tests

#### Integrationstests

- **Aufgabe:** API-Endpoint-Tests
- **KI-Unterstützung:**
  - Mock-Setup für Dependencies
  - Test-Daten generieren
  - Assertions strukturieren

### Dokumentation

#### Code-Dokumentation

- **Aufgabe:** JSDoc-Kommentare hinzufügen
- **KI-Unterstützung:**
  - Function-Beschreibungen
  - Parameter-Dokumentation
  - Return-Type-Dokumentation

#### README und Dokumentations-Dateien

- **Aufgabe:** Projekt-Dokumentation erstellen
- **KI-Unterstützung:**
  - Installations-Anleitungen
  - API-Dokumentation
  - Deployment-Guides

## Risiko

KI generiert Code ohne tiefes Verständnis des Kontexts und der Security-Anforderungen.

## Getroffene Gegenmaßnahmen

### 1. Code-Review

#### Menschliches Review

**Implementierung:** Alle KI-generierten Code-Patches wurden manuell überprüft.

**Review-Checkliste:**

- [ ] Input Validation vorhanden?
- [ ] Error-Handling vollständig?
- [ ] Security-Schutz implementiert?
- [ ] Performance akzeptabel?
- [ ] Code-Style konsistent?

#### Security-Fokus

- Spezielle Prüfung auf:
  - SQL-Injection-Möglichkeiten
  - XSS-Vektoren
  - CSRF-Schutz
  - Input Validation
  - Output Encoding

### 2. Vulnerability Scanning

#### npm audit

**Implementierung:** Automatische Prüfung auf bekannte CVEs.

```bash
# Entwicklung
npm audit

# CI/CD Pipeline
npm audit --audit-level=high
```

**Verhalten:**

- Build bricht bei High/Critical-Schwachstellen ab
- Manual Updates für Moderate/Low-Schwachstellen

#### Dependency Updates

**Implementierung:** Regelmäßige Updates von Dependencies.

```bash
# Prüfen auf veraltete Packages
npm outdated

# Updates installieren
npm update
```

### 3. Unit- und Integrationstests

#### Security-Tests

**Implementierung:** Explizite Tests für Security-Funktionalität.

```typescript
describe("XSS Prevention", () => {
  it("should sanitize script tags", () => {
    const malicious = "<script>alert('xss')</script>";
    const sanitized = sanitizeMarkdown(malicious);
    expect(sanitized).not.toContain("<script>");
  });
});

describe("Password Strength", () => {
  it("should reject weak passwords", () => {
    expect(() => {
      passwordService.assertStrong("password123", { userInputs: [] });
    }).toThrow("WEAK_PASSWORD");
  });
});
```

#### Test-Driven Development

**Implementierung:** Security-Funktionalität wurde getestet, bevor implementiert.

**Workflow:**

1. Test schreiben
2. Test failt (rot)
3. KI generiert Implementierung
4. Developer reviewed Implementierung
5. Test passes (grün)

### 4. Secret Scanning

#### Gitleaks

**Implementierung:** Automatische Prüfung von Commits auf Secrets.

```yaml
# .github/workflows/verify.yml
- name: Gitleaks Secret Scan
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Erkannte Secrets:**

- API-Keys
- Database-Passwords
- JWT Secrets
- SMTP-Credentials

**Pipeline-Verhalten:**

- Bei gefundene Secrets: Build bricht ab
- Pull Request wird blockiert

#### Environment-Variablen

**Implementierung:** Alle Secrets in `.env`, nie im Code.

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=super_secret_min_32_chars
```

#### NIST Digital Identity Guidelines

**Implementierung:** Password-Policy folgt NIST SP 800-63B.

**Empfehlungen:**

- Minimum 8 Zeichen Länge
- Keine zwingenden Sonderzeichen (aber empfohlen)
- Entropie-basierte Stärke-Bewertung (zxcvbn)
- Keine maximalen Passwort-Ablaufdaten

#### Current Standards

**Implementierung:** Nutzung moderner Libraries.

| Security-Funktion | Library            | Standard              |
| ----------------- | ------------------ | --------------------- |
| Password Hashing  | argon2             | PHC Winner 2015       |
| JWT               | jose               | RFC 7519              |
| HTML Sanitization | sanitize-html      | OWASP                 |
| Rate Limiting     | express-rate-limit | Express Best Practice |

### 5. Manual Security Review

#### Manual Testing

**Implementierung:** Manuelle Tests auf Security-Attacks.

**Test-Szenarien:**

- XSS-Angriffe in Notizen
- CSRF-Token manipulation
- SQL-Injection in Search-Queries
- Brute-Force auf Login
- Session-Hijacking-Versuche

## Fazit

KI wurde als **Werkzeug zur Beschleunigung und Inspiration** eingesetzt, aber alle kritischen Security-Entscheidungen und Implementierungen wurden:

1. **Manuell verifiziert**
2. **Getestet durch Unit- und Integrationstests**
3. **Überwacht durch Automated Scanning**

**Der Mensch bleibt letztverantwortlich für die Sicherheit der Anwendung.**

## Nächste Schritte

- [Bekannte Schwachstellen](12-schwachstellen.md) - Ehrliche Risikoanalyse
