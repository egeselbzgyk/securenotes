# SecureNotes - Projektdokumentation

Willkommen zur Projektdokumentation von **SecureNotes**.

## Vollständige Dokumentation

Die vollständige Projektdokumentation ist verfügbar unter:
**https://egeselbzgyk.github.io/securenotes/**

Die Dokumentation beinhaltet:

- Architekturübersicht
- Sicherheitskonzept (detailliert)
- Datenschutz
- CI/CD & DevSecOps
- Docker & Deployment
- Umgebungsvariablen
- Lokale Ausführung
- Einsatz von KI
- Bekannte Schwachstellen & Verbesserungsmöglichkeiten

---

## 1. Projektübersicht

### Kurzbeschreibung der Anwendung

SecureNotes ist eine moderne, webbasierte Notizverwaltungsanwendung, die Benutzern ermöglicht, Markdown-formatierte Notizen zu erstellen, zu bearbeiten und zu verwalten. Die Anwendung unterstützt verschiedene Sichtbarkeitseinstellungen (privat vs. öffentlich), eine Volltextsuche sowie das Teilen von Notizen über Links. Die Notizen können YouTube-Videos über eine spezielle Embed-Syntax einbinden.

### Ziel des Projekts im Kontext Secure Software Engineering

Das Projekt wurde im Rahmen des Moduls "Secure Software Engineering" entwickelt, um die praktische Anwendung moderner Sicherheitskonzepte in einer Full-Stack-Anwendung zu demonstrieren. Der Schwerpunkt liegt auf der Implementierung von Defense-in-Depth-Strategien, sicherer Authentifizierung, Eingabevalidierung, Content Security Policy und der Einhaltung von Security-by-Design-Prinzipien.

### Security-Fokus

- **Defense-in-Depth:** Mehrere Sicherheitsschichten (Authentifizierung, Input Validation, Output Encoding)
- **Security-by-Design:** Sicherheit von Anfang an in Architektur und Design integriert
- **OWASP Top 10:** Adressierung der häufigsten Web-Sicherheitsrisiken
- **Defense-in-Code:** Defensive Programmierung mit Typisierung und Validierung

## 2. Verwendete Technologien

### Frontend

#### React 19.2.3 + TypeScript

- **Warum gewählt:** React ist die etablierteste UI-Bibliothek mit einem großen Ökosystem. TypeScript ermöglicht statische Typisierung zur Laufzeit-Fehlervermeidung.
- **Sicherheitsrelevante Eigenschaften:** Statische Typisierung verhindert viele Fehler, Vite bietet schnelles HMR.
- **Risiken & Adressierung:** Reacts `dangerouslySetInnerHTML` wird kontrolliert verwendet, um XSS zu verhindern.

#### Vite 6.2.0

- **Warum gewählt:** Schnellerer Build- und Entwicklungsserver als webpack mit optimierter Hot Module Replacement (HMR).
- **Sicherheitsrelevante Eigenschaften:** Nutzt ES Modules für bessere Tree-Shaking-Effizienz.

#### Tailwind CSS 3.4.17

- **Warum gewählt:** Utility-First-CSS-Framework für schnelle UI-Entwicklung mit konsistentem Design.
- **Risiken:** Größere CSS-Bundle-Größe in kleinen Anwendungen. Durch Purging während des Build-Prozesses minimiert.

### Backend

#### Express.js 5.2.1 + TypeScript

- **Warum gewählt:** Minimalistisches, bewährtes Node.js-Framework mit flexibler Middleware-Architektur.
- **Sicherheitsrelevante Eigenschaften:** Ermöglicht granulare Sicherheitsmiddleware (Helmet, CORS, Rate-Limiting).
- **Risiken:** Bekannte Sicherheitslücken in älteren Node-Versionen. Durch Nutzung von LTS-Patches und regelmäßige Dependency-Updates adressiert.

#### Node.js 20 (Alpine Linux)

- **Warum gewählt:** LTS-Version mit stabiler Laufzeitumgebung. Alpine-Basis reduziert Image-Größe und Angriffsfläche.
- **Risiken:** Bekannte Sicherheitslücken in älteren Node-Versionen. Durch Nutzung von LTS-Patches und regelmäßige Dependency-Updates adressiert.

### Datenbank

#### PostgreSQL

- **Warum gewählt:** Relationales Datenbanksystem mit starkem SQL-Support und ACID-Garantien.
- **Sicherheitsrelevante Eigenschaften:** Row-Level Security (RLS)-Unterstützung, robuste Authentifizierung, verschlüsselte Verbindungen möglich.
- **Risiken:** SQL-Injection bei unsicherer Query-Implementierung. Durch Prisma ORM (parametrisierte Queries) vollständig adressiert.

#### Prisma ORM 7.2.0

- **Warum gewählt:** TypeScript-First ORM mit Migrationen, Type-Safety und automatischem Client-Generation.
- **Sicherheitsrelevante Eigenschaften:** Automatische Parametrisierung gegen SQL-Injection, Schema-Validierung zur Laufzeit.

### CI/CD

#### GitHub Actions

- **Verwendeter Workflow:** `.github/workflows/verify.yml`
- **Security-Steps:** Gitleaks Secret Scanning, npm audit (high), Dependency Updates.

### Docker

#### Docker Compose

- **Services:** PostgreSQL, Mailpit, Backend, Frontend (Nginx).

---
