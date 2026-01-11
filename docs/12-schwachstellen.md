# 12. Bekannte Schwachstellen & Verbesserungsmöglichkeiten

## Überblick

Dieses Kapitel listet identifizierte Sicherheitsaspekte und potenzielle Verbesserungen auf. Die Risiken sind nach Dringlichkeit priorisiert.

## Prioritätsskala

|     | Beschreibung     | Handlungsempfehlung       |
| --- | ---------------- | ------------------------- |
|     | Sofortige Gefahr | Sofort implementieren     |
|     | Hohes Risiko     | Bald implementieren       |
|     | Mittleres Risiko | Geplant implementieren    |
|     | Geringes Risiko  | Bei Bedarf implementieren |

---

## 1. Datenbank-Port-Exposition

### Beschreibung

In containerisierten Anwendungen wird der Datenbank-Port oft nach außen exponiert.

### Gefährdung

- Direkter Datenbank-Zugriff ohne Application-Layer möglich
- Brute-Force-Angriffe auf Credentials von extern möglich
- Unautorisierter Zugriff wenn Firewall nicht konfiguriert ist

### Lösung

**Lokale Entwicklung:**

```yaml
database:
  ports:
    - "127.0.0.1:5432:5432"
```

**Produktion:**

```yaml
database:
  # ports:
  #   - "5432:5432"
```

### Priorität

**Kritisch** - Für Production zwingend erforderlich

---

## 2. Fehlende Rate Limits für ressourcenintensive Operationen

### Beschreibung

Suchabfragen und ähnliche ressourcenintensive Endpunkte haben keine spezifischen Limits.

### Gefährdung

- DoS-Angriffe möglich
- Datenbank-Last durch komplexe Queries
- Enumeration durch viele Suchanfragen

### Lösung

```typescript
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

app.get("/search", searchLimiter, searchHandler);
```

### Priorität

**Mittel** - Für skalierte Anwendungen wichtig

---

## 3. Keine automatische Bereinigung abgelaufener Daten

### Beschreibung

Temporäre Daten (Tokens, Sessions) werden nicht automatisch bereinigt.

### Gefährdung

- Datenbank-Wachstum unkontrolliert
- Alte sensible Daten verbleiben
- DSGVO-Verstöße möglich

### Lösung

Scheduled Job für tägliche Bereinigung:

```typescript
cron.schedule("0 3 * * *", async () => {
  await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
    },
  });
  await prisma.session.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
    },
  });
});
```

### Priorität

**Mittel** - Für langfristigen Betrieb notwendig

---

## 4. Kein CSP Report-Only Mode

### Beschreibung

CSP ist aktiv, aber keine Report-Only-Phase vor Deployment.

### Gefährdung

- CSP-Verstöße können Funktionalität ohne Vorwarnung brechen
- Kein Monitoring von Verstößen

### Lösung

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        reportUri: "/api/csp-report",
      },
      reportOnly: !isProd,
    },
  })
);
```

### Priorität

**Niedrig** - Für Deployment-Workflow empfohlen

---

## 5. Fehlender HSTS Header

### Beschreibung

HSTS-Header fehlt.

### Gefährdung

- Downgrade-Angriffe möglich
- Man-in-the-Middle-Angriffe möglich

### Lösung

```typescript
app.use(
  helmet({
    ...(isProd
      ? {
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
        }
      : {}),
  })
);
```

### Priorität

**Mittel** - Für Production notwendig

---

## 6. Kein Rate Limiting für API-Keys

### Beschreibung

API-Keys haben keine spezifischen Rate Limits.

### Gefährdung

- Kompromittierung führt zu unbegrenztem Zugriff
- Abrechnungs-Risiko bei kostenpflichtigen APIs

### Lösung

```typescript
const apiKeyLimiter = rateLimit({
  keyGenerator: (req) => req.get("x-api-key"),
  windowMs: 3600000,
  max: 1000,
});
```

### Priorität

**Mittel** - Für produktive API-Keys wichtig

---

## 7. Fehlende explizite Input-Length-Validierung

### Beschreibung

Keine explizite Validierung der maximalen Länge von User-Inputs.

### Gefährdung

- Memory Exhaustion möglich
- DoS durch riesige Strings
- Unvorhersehbares Verhalten

### Lösung

```typescript
const createNoteSchema = z.object({
  content: z.string().max(1000000),
});
```

### Priorität

**Niedrig** - Bereits durch ORM limitiert

---

## 8. Keine IP-Whitelist für API-Keys

### Beschreibung

API-Keys sind nicht an IPs gebunden.

### Gefährdung

- API-Key von jedem Ort nutzbar
- Globaler Zugriff bei Kompromittierung

### Lösung

```prisma
model ApiKey {
  allowedIps String[]
}

if (apiKey.allowedIps?.length > 0) {
  if (!apiKey.allowedIps.includes(ipAddress)) return null;
}
```

### Priorität

**Niedrig** - Für Enterprise-Szenarien

---

## 9. Kein Audit Logging

### Beschreibung

Kein zentrales Audit-Log für kritische Aktionen.

### Gefährdung

- Keine forensische Analyse möglich
- Compliance-Probleme

### Lösung

```prisma
model AuditLog {
  action String
  resource String?
  ipAddress String?
  createdAt DateTime
}

app.post("/login", auditMiddleware("LOGIN"), loginHandler);
```

### Priorität

**Mittel** - Für Compliance wichtig

---

## 10. Fehlende 2-Faktor-Authentifizierung

### Beschreibung

Keine Option für 2FA.

### Gefährdung

- Phishing kann Passwort kompromittieren
- Keine zusätzliche Schutzschicht

### Lösung

TOTP-Implementierung mit Authenticator:

```typescript
import { authenticator } from "otlib";

export const generateTOTPSecret = () => authenticator.generateSecret();
export const verifyTOTP = (token, secret) =>
  authenticator.verify({ token, secret });
```

### Priorität

**Niedrig** - Für Higher Security-Levels epfohlen

---

## Ressourcen

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Guidelines](https://pages.nist.gov/800-63/sp800-63b.html)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

**Verantwortliche:** SecureNotes Development Team
**Datum:** 11. Januar 2026
**Version:** 1.0
