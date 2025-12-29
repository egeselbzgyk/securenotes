import React, { useEffect, useState } from "react";
import { AuthApi } from "../api";
import { useRouter } from "../router";
import { Button, Input, PasswordStrength } from "../components/ui";
import { useAuth } from "../auth-context";

export const ResetPassword: React.FC = () => {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const [status, setStatus] = useState<
    "loading" | "validating" | "form" | "success" | "error"
  >("loading");
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      // Extract token from either search query or hash
      let extractedToken = "";
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("token")) {
        extractedToken = searchParams.get("token") || "";
      } else {
        // Fallback: Check hash query params if router puts them there
        const hashParts = window.location.hash.split("?");
        if (hashParts.length > 1) {
          const hashParams = new URLSearchParams(hashParts[1]);
          extractedToken = hashParams.get("token") || "";
        }
      }

      if (!extractedToken) {
        setStatus("error");
        setMsg("Kein Reset-Token gefunden.");
        return;
      }

      setToken(extractedToken);
      setStatus("validating");

      // Validate token with backend
      try {
        await AuthApi.validatePasswordReset(extractedToken);
        setStatus("form");
      } catch (err) {
        setStatus("error");
        setMsg("Dieser Link ist bereits verwendet oder abgelaufen. Bitte fordern Sie einen neuen Link an.");
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      }
    };

    validateToken();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await AuthApi.confirmPasswordReset({
        token,
        newPassword,
      });
      // Log out the user after successful password reset
      logout();
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setMsg(
        e instanceof Error ? e.message : "Passwort zurücksetzen fehlgeschlagen."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark text-white p-4">
      <div className="bg-card-dark p-8 rounded-xl shadow-xl border border-border-dark max-w-md w-full">
        {(status === "loading" || status === "validating") && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold">
              {status === "validating" ? "Prüfe Link..." : "Lade..."}
            </h2>
          </div>
        )}
        {status === "form" && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-center">
              Neues Passwort festlegen
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">
                  Neues Passwort
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mindestens 8 Zeichen"
                  />
                  <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </div>
                </div>
                <PasswordStrength password={newPassword} />
                <div className="text-xs text-gray-500 mt-2">
                  Das Passwort muss enthalten:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Mindestens 8 Zeichen</li>
                    <li>Mindestens ein Großbuchstabe (A-Z)</li>
                    <li>Mindestens ein Kleinbuchstabe (a-z)</li>
                    <li>Mindestens eine Zahl (0-9)</li>
                    <li>Mindestens ein Sonderzeichen (-+!@#$%^&*)</li>
                  </ul>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Wird gespeichert..." : "Passwort ändern"}
              </Button>
            </form>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-900/30 text-green-500 flex items-center justify-center mb-4 border border-green-900/50">
              <span className="material-symbols-outlined text-2xl">check</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Passwort geändert!</h2>
            <p className="text-gray-400 mb-6">
              Ihr Passwort wurde erfolgreich geändert. Bitte melden Sie sich mit
              Ihrem neuen Passwort an.
            </p>
            <Button onClick={() => navigate("/auth")}>Zur Anmeldung</Button>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center text-center">
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
