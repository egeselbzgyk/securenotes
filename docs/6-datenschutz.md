# 6. Datenschutz

## Übersicht

SecureNotes wurde unter Berücksichtigung der DSGVO (Datenschutz-Grundverordnung) entwickelt und implementiert Privacy-by-Design-Prinzipien.

## Gespeicherte personenbezogene Daten

### User-Tabelle

| Feld | Typ | Beschreibung | Speicherdauer |
|------|-----|--------------|----------------|
| `id` | UUID | Eindeutige User-ID | Bis Löschung |
| `email` | String | E-Mail-Adresse (Authentifizierung) | Bis Löschung |
| `passwordHash` | String | Argon2id-gehashetes Passwort | Bis Löschung/Passwort-Change |
| `emailVerifiedAt` | DateTime | Zeitstempel der E-Mail-Verifikation | Bis Löschung |
| `emailVerificationTokenHash` | String? | Hash des Verifikations-Tokens | Bis Verifikation |
| `failedLoginAttempts` | Int | Anzahl fehlgeschlagener Logins | Bis erfolgreichem Login |
| `lockedUntil` | DateTime? | Account-Lockout-Zeitstempel | Bis Reset |
| `passwordChangedAt` | DateTime? | Zeitstempel der letzten Passwort-Änderung | Bis Löschung |
| `lastLoginAt` | DateTime? | Zeitstempel des letzten Logins | Bis Löschung |
| `isActive` | Boolean | Account-Aktivitäts-Status | Bis Löschung |
| `deletedAt` | DateTime? | Soft-Delete-Zeitstempel | Endgültige Löschung (nicht implementiert) |

### Session-Tabelle

| Feld | Typ | Beschreibung | Speicherdauer |
|------|-----|--------------|----------------|
| `id` | UUID | Session-ID | Bis Revokation/Expiration (7 Tage) |
| `userId` | String | User-ID | Bis Session-Ende |
| `refreshTokenHash` | String | SHA256-gehashter Refresh Token | Bis Session-Ende |
| `expiresAt` | DateTime | Ablaufdatum der Session | 7 Tage |
| `revokedAt` | DateTime? | Revokations-Zeitstempel | Bis Löschung |
| `rotatedAt` | DateTime? | Rotations-Zeitstempel | Bis Löschung |
| `userAgent` | String? | User-Agent-String | Bis Session-Ende |
| `ip` | String? | IP-Adresse | Bis Session-Ende |

### PasswordResetToken-Tabelle

| Feld | Typ | Beschreibung | Speicherdauer |
|------|-----|--------------|----------------|
| `id` | UUID | Token-ID | 30 Minuten |
| `userId` | String | User-ID | 30 Minuten |
| `tokenHash` | String | SHA256-gehashtes Token | 30 Minuten |
| `expiresAt` | DateTime | Ablaufdatum | 30 Minuten |
| `usedAt` | DateTime? | Zeitstempel der Nutzung | Bis Löschung |
| `ip` | String? | IP-Adresse | 30 Minuten |
| `userAgent` | String? | User-Agent-String | 30 Minuten |

### Notizen

| Feld | Typ | Beschreibung | Speicherdauer |
|------|-----|--------------|----------------|
| `id` | UUID | Notiz-ID | Bis Löschung durch User |
| `title` | String? | Notiz-Titel | Bis Löschung |
| `content` | String | Markdown-Inhalt | Bis Löschung |
| `htmlContent` | String | Gesanitiziertes HTML | Bis Löschung |
| `visibility` | Enum | PUBLIC oder PRIVATE | Bis Löschung |
| `authorId` | String | User-ID des Autors | Bis Löschung |
| `createdAt` | DateTime | Erstellungszeitstempel | Bis Löschung |
| `updatedAt` | DateTime | Aktualisierungszeitstempel | Bis Löschung |

### ApiKey-Tabelle

| Feld | Typ | Beschreibung | Speicherdauer |
|------|-----|--------------|----------------|
| `id` | UUID | API-Key-ID | Bis Revokation |
| `key` | String | SHA256-gehashter API-Key | Bis Revokation |
| `name` | String | API-Key-Name | Bis Revokation |
| `userId` | String | User-ID | Bis Revokation |
| `isActive` | Boolean | Aktivitäts-Status | Bis Revokation |
| `expiresAt` | DateTime? | Ablaufdatum | Bis Revokation/Expiration |
| `lastUsedAt` | DateTime? | Zeitstempel der letzten Nutzung | Bis Revokation |

## Zweckbindung

### Authentifizierungsdaten

| Daten | Zweck | Rechtsgrundlage |
|--------|---------|-----------------|
| E-Mail | User-Identifikation, Kommunikation | Vertragserfüllung |
| Passwort-Hash | Authentifizierung | Vertragserfüllung |
| IP/User-Agent | Forensik, Kompromittierungs-Erkennung | Berechtigte Interessen |

### Sitzungsdaten

| Daten | Zweck | Rechtsgrundlage |
|--------|---------|-----------------|
| Refresh Token Hash | Session-Management | Vertragserfüllung |
| IP/User-Agent | Forensik, Sicherheitsüberwachung | Berechtigte Interessen |

### Nutzungsdaten

| Daten | Zweck | Rechtsgrundlage |
|--------|---------|-----------------|
| Notizen (Inhalt, Titel) | Primäre Funktionalität | Vertragserfüllung |
| Notiz-Metadaten | Notiz-Verwaltung | Vertragserfüllung |
| API-Keys | Programmatischer Zugriff | Vertragserfüllung |

## Datensparsamkeit

### Minimale Datensammlung

- **Keine unnötigen Daten:** Vorname, Nachname, Telefonnummer, Geburtsdatum, Adresse werden nicht gespeichert
- **Optionalitätsprinzip:** IP-Adressen und User-Agent sind optional (wenn nicht verfügbar)
- **E-Mail als primärer Identifikator:** Keine zusätzlichen Profil-Daten

### Data Minimization

| Daten | Status |
|--------|---------|
| IP-Adressen | Optional, nicht für User-Profiling genutzt |
| User-Agent | Optional, nicht für User-Profiling genutzt |
| Such-Queries | Nicht gespeichert (Privacy-by-Design) |
| Notiz-Views | Nicht protokolliert |
| Klick-Tracking | Nicht implementiert |

## DSGVO-relevante Überlegungen

### Recht auf Löschung (Art. 17 DSGVO)

**Aktueller Status:**
- `deletedAt` implementiert Soft-Delete (für Audit-Trail)
- Endgültige Löschung nicht implementiert

**Empfehlung:**
```typescript
// Erweiterte delete-Funktion
export const deleteUserPermanently = async (userId: string) => {
  // 1. Alle Sessions löschen
  await prisma.session.deleteMany({ where: { userId } });
  
  // 2. Alle API-Keys löschen
  await prisma.apiKey.deleteMany({ where: { userId } });
  
  // 3. Alle Reset-Tokens löschen
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  
  // 4. Alle Notizen löschen
  await prisma.note.deleteMany({ where: { authorId: userId } });
  
  // 5. User identitäten löschen
  await prisma.userIdentity.deleteMany({ where: { userId } });
  
  // 6. User löschen
  await prisma.user.delete({ where: { id: userId } });
};
```

### Recht auf Auskunft (Art. 15 DSGVO)

**Aktueller Status:**
- Nicht implementiert

**Empfehlung:**
```typescript
export const exportUserData = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true, updatedAt: true }
  });
  
  const notes = await prisma.note.findMany({
    where: { authorId: userId }
  });
  
  const sessions = await prisma.session.findMany({
    where: { userId },
    select: { createdAt: true, expiresAt: true, userAgent: true }
  });
  
  return { user, notes, sessions };
};
```

### Recht auf Berichtigung (Art. 16 DSGVO)

**Aktueller Status:**
- E-Mail-Änderung nicht implementiert
- Notizen können bearbeitet/gelöscht werden

**Empfehlung:**
```typescript
export const updateUserEmail = async (
  userId: string,
  newEmail: string
) => {
  // Neue E-Mail muss verifiziert werden
  const { tokenPlain, tokenHash } = tokenService.createEmailVerificationToken();
  
  await prisma.$transaction(async (tx) => {
    // E-Mail temporär speichern (nicht verifiziert)
    await tx.user.update({
      where: { id: userId },
      data: { email: newEmail, emailVerifiedAt: null }
    });
    
    // Verifikations-Token speichern
    await tx.user.update({
      where: { id: userId },
      data: { emailVerificationTokenHash: tokenHash }
    });
  });
  
  await mailService.sendVerifyEmail(newEmail, {
    link: `${process.env.FRONTEND_BASE_URL}/verify-email?token=${tokenPlain}`
  });
};
```

### Datenminimierung (Art. 5 Abs. 1 lit. c DSGVO)

**Implementierte Maßnahmen:**
- Keine Tracking-Cookies (nur HttpOnly-Auth-Cookies)
- IP-Adressen optional und nicht für User-Profiling
- Keine Such-Historie gespeichert
- Keine View-Tracking für Notizen

**Offene Punkte:**
- Soft-Delete ohne endgültige Löschung nach Aufbewahrungsfrist
- Keine Data-Retention-Policy implementiert

### Datenschutzgrundsätze (Art. 5 DSGVO)

| Prinzip | Status |
|----------|---------|
| Rechtmäßigkeit | ✅ Vertragserfüllung, berechtigte Interessen |
| Zweckbindung | ✅ Daten nur für definierte Zwecke |
| Datenminimierung | ✅ Nur notwendige Daten gespeichert |
| Richtigkeit | ✅ Daten können durch User aktualisiert werden |
| Speicherbegrenzung | ⚠️ Soft-Delete ohne endgültige Löschung |
| Integrität und Vertraulichkeit | ✅ HTTPS, Encryption, Access Control |

### Storage Security

**Passwörter:**
- Hash-Algorithmus: Argon2id (Memory-Hard)
- Salt: Pro Hash einzigartig (16 Bytes)
- Klartext-Passwort nie gespeichert

**Tokens:**
- Refresh Tokens: SHA256-gehashed
- API-Keys: SHA256-gehashed
- Reset Tokens: SHA256-gehashed

**Datenbank:**
- Verschlüsselte Verbindungen möglich (TLS)
- Docker-Netzwerk-Isolation
- Keine direkte externe Exposition (Produktion)

## Offene Punkte und Empfehlungen

### 1. Data Retention Policy

**Problem:** Keine automatische Löschung alter Daten

**Empfehlung:**
```typescript
// Cron-Job für Datenbereinigung
cron.schedule('0 3 * * *', async () => {  // Täglich um 3 Uhr
  // Alte Sessions löschen
  await prisma.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } }
      ]
    }
  });
  
  // Alte Reset-Tokens löschen
  await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { usedAt: { not: null } }
      ]
    }
  });
});
```

### 2. Audit Logging

**Problem:** Kein Audit-Log für Compliance-Dokumentation

**Empfehlung:**
```typescript
model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String   // LOGIN, LOGOUT, NOTE_CREATE, etc.
  resource  String?  // note:123, user:456
  ipAddress String?
  userAgent String?
  metadata  Json?
  createdAt DateTime @default(now())
}
```

### 3. Cookie Banner

**Problem:** Keine DSGVO-konforme Cookie-Banner-Einwilligung

**Hinweis:** Die Anwendung nutzt nur essentielle Cookies (HttpOnly-Auth-Cookies). Ein Banner ist optional, aber empfohlen für Transparenz.

### 4. DSGVO-Konformer Export

**Problem:** Keine Möglichkeit für Users, ihre Daten zu exportieren

**Empfehlung:** Implementierung von `exportUserData` Funktion und Frontend-UI für Data Portability.

## Nächste Schritte

- [CI/CD & DevSecOps](7-cicd.md) - Build- und Deployment-Pipeline
