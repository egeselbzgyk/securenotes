// api.ts
// SOURCE OF TRUTH for API contracts and network behavior

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Helper to read cookies
function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const headers: Record<string, string> = {};
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // 1. Attach Access Token if available
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // 2. Attach CSRF Token for state-changing requests (Double-submit pattern)
  if (
    options.method &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(options.method.toUpperCase())
  ) {
    const csrf = getCookie("csrf_token");
    if (csrf) {
      headers["x-csrf-token"] = csrf;
    }
  }

  headers["Content-Type"] = "application/json";

  // 3. Credentials include to send/receive cookies (refresh token, csrf_token)
  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let response = await fetch(url, config);

  // 4. Handle 401 (Unauthorized) - Attempt Silent Refresh
  // Condition: 401 and NOT already on the refresh endpoint
  if (
    response.status === 401 &&
    !endpoint.includes("/auth/refresh") &&
    !endpoint.includes("/auth/login")
  ) {
    try {
      // POST /auth/refresh
      const refreshCsrf = getCookie("csrf_token");
      const refreshHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (refreshCsrf) refreshHeaders["x-csrf-token"] = refreshCsrf;

      const refreshResponse = await fetch("/auth/refresh", {
        method: "POST",
        headers: refreshHeaders,
        credentials: "include",
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.ok && data.accessToken) {
          setAccessToken(data.accessToken);

          // Retry original request with new token
          headers["Authorization"] = `Bearer ${data.accessToken}`;
          // If CSRF rotated, update it too
          const newCsrf = getCookie("csrf_token");
          if (newCsrf && headers["x-csrf-token"]) {
            headers["x-csrf-token"] = newCsrf;
          }

          response = await fetch(url, { ...config, headers });
        } else {
          throw new Error("Refresh failed");
        }
      } else {
        throw new Error("Refresh failed");
      }
    } catch (e) {
      setAccessToken(null);
      window.dispatchEvent(new Event("auth:logout"));
      throw e; // Propagate error so caller knows it failed
    }
  }

  // 5. Rate Limit Handling
  if (response.status === 429) {
    throw new Error("Zu viele Anfragen. Bitte später erneut versuchen.");
  }

  return response;
}

// --- Domain Models ---
export type Visibility = "PUBLIC" | "PRIVATE";

export interface Note {
  id: string;
  title: string | null;
  content: string;
  htmlContent?: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
  authorId?: string; // internal but sometimes useful
}

// --- Typed API Methods ---

export const AuthApi = {
  login: async (data: { email: string; password: string }) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error("Ungültige Anmeldedaten.");
    }
    return json; // { ok: true, accessToken: string }
  },

  register: async (data: { email: string; name: string; password: string }) => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (!res.ok) {
      // Handle Zod errors if available
      if (json.errors) {
        const msgs = json.errors.map((e: any) => e.message).join(", ");
        throw new Error(msgs || "Ungültige Daten.");
      }
      throw new Error(json.message || "Registrierung fehlgeschlagen.");
    }
    return json; // { id: uuid }
  },

  refresh: async () => {
    // POST /auth/refresh
    const res = await apiFetch("/auth/refresh", { method: "POST" });
    if (!res.ok) throw new Error("Session expired");
    return res.json(); // { ok: true, accessToken: string }
  },

  logout: async () => {
    try {
      // POST /auth/logout
      await apiFetch("/auth/logout", { method: "POST" });
      setAccessToken(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  },

  requestPasswordReset: async (email: string) => {
    // POST /auth/password-reset/request
    // Always returns ok: true
    await apiFetch("/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return true;
  },

  validatePasswordReset: async (token: string) => {
    // POST /auth/password-reset/validate
    // Validates if token is valid and not used/expired
    const res = await apiFetch("/auth/password-reset/validate", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    if (!res.ok || !json.valid) {
      throw new Error("Token ist ungültig oder bereits verwendet.");
    }
    return json;
  },

  confirmPasswordReset: async (data: {
    token: string;
    newPassword: string;
  }) => {
    // POST /auth/password-reset/confirm
    const res = await apiFetch("/auth/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      // Handle Zod errors if available
      if (json.errors) {
        const msgs = json.errors.map((e: any) => e.message).join(", ");
        throw new Error(msgs || "Ungültige Daten.");
      }
      throw new Error(
        json.message || "Fehler beim Zurücksetzen des Passworts."
      );
    }
    return json;
  },

  verifyEmail: async (token: string) => {
    // POST /auth/verify-email
    const res = await apiFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok)
      throw new Error(json.message || "Verifizierung fehlgeschlagen.");
    return json;
  },
};

export const NotesApi = {
  list: async (params?: { search?: string; filter?: "own" | "public" }) => {
    let endpoint = "/notes/";
    const queryParams: Record<string, string> = {};

    if (params?.search) {
      endpoint = "/notes/search";
      queryParams.query = params.search;
      if (params.filter) queryParams.type = params.filter;
    } else {
      // Standard list now supports filter parameter
      if (params.filter) queryParams.type = params.filter;
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = queryString ? `${endpoint}?${queryString}` : endpoint;

    const res = await apiFetch(fullUrl);
    if (!res.ok) throw new Error("Fehler beim Laden der Notizen.");
    return (await res.json()) as Note[];
  },

  get: async (id: string) => {
    const res = await apiFetch(`/notes/${id}`);
    if (!res.ok) throw new Error("Notiz nicht gefunden.");
    return (await res.json()) as Note;
  },

  create: async (data: {
    title?: string;
    content: string;
    visibility: Visibility;
  }) => {
    // POST /notes/
    const res = await apiFetch("/notes/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Fehler beim Erstellen der Notiz.");
    return (await res.json()) as Note;
  },

  update: async (
    id: string,
    data: { title?: string; content?: string; visibility?: Visibility }
  ) => {
    const res = await apiFetch(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Fehler beim Speichern.");
    return (await res.json()) as Note;
  },

  delete: async (id: string) => {
    const res = await apiFetch(`/notes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Fehler beim Löschen.");
    return true;
  },
};

// --- API Key Types & Methods ---
export interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  key?: string; // Only present immediately after creation
}

export const ApiKeyApi = {
  list: async () => {
    const res = await apiFetch("/api-keys");
    if (!res.ok) throw new Error("Fehler beim Laden der API-Keys.");
    return (await res.json()) as ApiKey[];
  },

  create: async (name: string, expiresInDays?: number) => {
    const res = await apiFetch("/api-keys", {
      method: "POST",
      body: JSON.stringify({ name, expiresInDays }),
    });
    if (!res.ok) throw new Error("Fehler beim Erstellen des API-Keys.");
    return (await res.json()) as ApiKey;
  },

  revoke: async (id: string) => {
    const res = await apiFetch(`/api-keys/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Fehler beim Löschen des API-Keys.");
    return true;
  },
};
