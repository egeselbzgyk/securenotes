# 1. Projektübersicht

## Kurzbeschreibung der Anwendung

SecureNotes ist eine moderne, webbasierte Notizverwaltungsanwendung, die Benutzern ermöglicht, Markdown-formatierte Notizen zu erstellen, zu bearbeiten und zu verwalten. Die Anwendung unterstützt verschiedene Sichtbarkeitseinstellungen (privat vs. öffentlich), eine Volltextsuche sowie das Teilen von Notizen über Links. Die Notizen können YouTube-Videos über eine spezielle Embed-Syntax einbinden.

## Ziel des Projekts im Kontext Secure Software Engineering

Das Projekt wurde im Rahmen des Moduls "Secure Software Engineering" entwickelt, um die praktische Anwendung moderner Sicherheitskonzepte in einer Full-Stack-Anwendung zu demonstrieren. Der Schwerpunkt liegt auf der Implementierung von Defense-in-Depth-Strategien, sicherer Authentifizierung, Eingabevalidierung, Content Security Policy und der Einhaltung von Security-by-Design-Prinzipien.

### Security-Fokus

- **Defense-in-Depth:** Mehrere Sicherheitsschichten (Authentifizierung, Input Validation, Output Encoding)
- **Security-by-Design:** Sicherheit von Anfang an in Architektur und Design integriert
- **OWASP Top 10:** Adressierung der häufigsten Web-Sicherheitsrisiken
- **Defense-in-Code:** Defensive Programmierung mit Typisierung und Validierung

## Abgrenzung des Funktionsumfangs

### Enthaltene Funktionen

- ✅ Benutzerregistrierung mit E-Mail-Verifikation
- ✅ Login mit Passwort und Google OAuth
- ✅ Passwort-Zurücksetzen-Funktion
- ✅ CRUD-Operationen für Notizen
- ✅ Markdown-Unterstützung mit HTML-Sanitization
- ✅ YouTube-Video-Embedding
- ✅ Volltextsuche über Notizen
- ✅ Sichtbarkeitseinstellungen (PRIVATE/PUBLIC)
- ✅ API-Key-Management für programmatischen Zugriff
- ✅ Session-Management mit Rotation
- ✅ CSRF-Schutz

### Nicht enthalten

- ❌ Kollaborative Bearbeitung (Real-time)
- ❌ Versionierung von Notizen
- ❌ Datei-Uploads
- ❌ Export-Funktionen (PDF, Markdown, etc.)
- ❌ Benachrichtigungssystem (Push, E-Mail-Benachrichtigungen)
- ❌ 2-Faktor-Authentifizierung (TOTP, SMS)
- ❌ Dark Mode Toggle (nur system-based)

## Sicherheitsprinzipien

Das Projekt folgt folgenden Sicherheitsprinzipien:

1. **Least Privilege:** Minimal notwendige Berechtigungen für alle Benutzer
2. **Fail Securely:** System verhält sich sicher bei Fehlern
3. **Defense in Depth:** Mehrere Sicherheitsschichten unabhängig voneinander
4. **Security through Obscurity vermeiden:** Sicherheit basiert auf offenen Prinzipien
5. **Default Deny:** Standardmäßig alles verbieten, nur explizit erlauben

## Nächste Schritte

- [Gruppenmitglieder](2-gruppenmitglieder.md) - Erfahren Sie mehr über das Entwicklungsteam
- [Verwendete Technologien](3-technologien.md) - Detaillierte Übersicht über den Tech-Stack
- [Sicherheitskonzept](5-sicherheitskonzept.md) - Tiefgehende Security-Analyse
