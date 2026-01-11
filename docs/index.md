# SecureNotes - Projektdokumentation

Willkommen zur Projektdokumentation von **SecureNotes**.

## Überblick

SecureNotes ist eine moderne, webbasierte Notizverwaltungsanwendung, die im Rahmen des Moduls "Secure Software Engineering" entwickelt wurde. Die Anwendung demonstriert die praktische Anwendung moderner Sicherheitskonzepte in einer Full-Stack-Architektur.

## Hauptmerkmale

- 🔐 **Sichere Authentifizierung** mit JWT und Refresh Tokens
- 📝 **Markdown-Unterstützung** mit HTML-Sanitization
- 🔍 **Volltextsuche** über alle Notizen
- 👁️ **Sichtbarkeitseinstellungen** (Privat vs. Öffentlich)
- 🎬 **YouTube-Embedding** mit Whitelist-Schutz
- 🔑 **API-Key-Management** für programmatischen Zugriff
- 🛡️ **Comprehensive Security** - Rate Limiting, CSRF, CSP, XSS-Schutz

## Technologie-Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Express.js, TypeScript, Node.js 20
- **Datenbank:** PostgreSQL mit Prisma ORM
- **Security:** Argon2, Helmet, Zod, jose, sanitize-html
- **Containerisierung:** Docker & Docker Compose
- **CI/CD:** GitHub Actions mit Security Scanning

## Dokumentationsinhalte

Diese Dokumentation behandelt alle Aspekte des SecureNotes-Projekts:

1. **Projektübersicht** - Ziel und Abgrenzung
2. **Gruppenmitglieder** - Team und Rollen
3. **Verwendete Technologien** - Detaillierte Technologie-Beschreibungen
4. **Architekturübersicht** - Systemarchitektur und Trust Boundaries
5. **Sicherheitskonzept** - Detaillierte Sicherheitsmaßnahmen
6. **Datenschutz** - DSGVO-relevante Überlegungen
7. **CI/CD & DevSecOps** - Build- und Deployment-Pipeline
8. **Docker & Deployment** - Container-Struktur
9. **Umgebungsvariablen** - Konfigurations-Referenz
10. **Lokale Ausführung** - Installations- und Start-Anleitung
11. **Einsatz von KI** - KI-gestützte Entwicklung
12. **Bekannte Schwachstellen** - Ehrliche Risikoanalyse

## Navigieren

Verwenden Sie das Navigationsmenü auf der linken Seite, um durch die verschiedenen Kapitel zu browsen. Die Dokumentation ist in logischer Reihenfolge organisiert - beginnend mit dem Projektüberblick bis hin zu den bekannten Schwachstellen und Verbesserungsmöglichkeiten.

## Quick Start

### Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/your-org/securenotes.git
cd securenotes

# Umgebung konfigurieren
cp .env.example .env

# Alle Services starten
docker-compose up --build
```

**Zugriff:**
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Mailpit (E-Mail-Test): http://localhost:8025

### Docker Services

| Service | Port | Beschreibung |
|---------|------|-------------|
| Frontend (Nginx) | 80 | React SPA |
| Backend (Express) | 3000 | REST API |
| PostgreSQL | 5432 | Datenbank |
| Mailpit | 1025/8025 | SMTP/Web UI |

## Lizenz

Dieses Projekt wurde im Rahmen akademischer Lehre erstellt. Für Lizenzinformationen siehe das Repository.

---

**Verantwortliche:** SecureNotes Development Team  
**Datum:** 11. Januar 2026  
**Version:** 1.0
