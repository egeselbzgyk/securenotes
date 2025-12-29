import React, { useEffect, useState } from "react";
import { AuthApi } from "../api";
import { useRouter } from "../router";
import { Button } from "../components/ui";

export const VerifyEmail: React.FC = () => {
  const { navigate } = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // Extract token from either search query or hash
    let token = "";
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("token")) {
      token = searchParams.get("token") || "";
    } else {
      // Fallback: Check hash query params if router puts them there
      const hashParts = window.location.hash.split("?");
      if (hashParts.length > 1) {
        const hashParams = new URLSearchParams(hashParts[1]);
        token = hashParams.get("token") || "";
      }
    }

    if (!token) {
      setStatus("error");
      setMsg("Kein Verifizierungs-Token gefunden.");
      return;
    }

    AuthApi.verifyEmail(token)
      .then(() => {
        setStatus("success");
      })
      .catch((e) => {
        setStatus("error");
        setMsg(e.message || "Verifizierung fehlgeschlagen.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark text-white p-4">
      <div className="bg-card-dark p-8 rounded-xl shadow-xl border border-border-dark max-w-md w-full text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold">E-Mail wird verifiziert...</h2>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-900/30 text-green-500 flex items-center justify-center mb-4 border border-green-900/50">
              <span className="material-symbols-outlined text-2xl">check</span>
            </div>
            <h2 className="text-xl font-bold mb-2">E-Mail verifiziert!</h2>
            <p className="text-gray-400 mb-6">
              Ihr Konto wurde erfolgreich aktiviert. Bitte melden Sie sich an.
            </p>
            <Button onClick={() => navigate("/auth")}>Zur Anmeldung</Button>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-500 flex items-center justify-center mb-4 border border-red-900/50">
              <span className="material-symbols-outlined text-2xl">error</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Fehler</h2>
            <p className="text-red-400 mb-6">{msg}</p>
            <Button variant="secondary" onClick={() => navigate("/auth")}>
              Zurück zur Anmeldung
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
