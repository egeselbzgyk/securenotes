import React, { useState } from "react";
import { useAuth } from "../auth-context";
import { AuthApi } from "../api";
import { Modal, Input, PasswordStrength } from "../components/ui";

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Password reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [showResetToast, setShowResetToast] = useState(false);

  // Password strength calculation - matches backend passwordSchema requirements
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[-+!@#$%^&*]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(formData.password);

  const getStrengthLabel = (s: number) => {
    if (s <= 1)
      return {
        label: "Sehr schwach",
        color: "text-red-500",
        bar: "bg-red-500",
      };
    if (s === 2)
      return {
        label: "Schwach",
        color: "text-orange-500",
        bar: "bg-orange-500",
      };
    if (s === 3)
      return {
        label: "Mittel",
        color: "text-yellow-500",
        bar: "bg-yellow-500",
      };
    return { label: "Stark", color: "text-green-500", bar: "bg-green-500" };
  };

  const strengthInfo = getStrengthLabel(strength);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({
          email: formData.email,
          password: formData.password,
        });
        setSuccess(
          "Bestätigungs-E-Mail gesendet. Bitte prüfe deinen Posteingang."
        );
        setFormData({ ...formData, password: "" });
      }
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AuthApi.requestPasswordReset(resetEmail);
      setResetMsg(
        "Wenn ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet."
      );
      setShowResetToast(true);
      setTimeout(() => setShowResetToast(false), 3000);
      setTimeout(() => {
        setIsResetModalOpen(false);
        setResetMsg("");
      }, 3000);
    } catch (err) {
      setResetMsg("Ein Fehler ist aufgetreten.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-x-hidden bg-background-dark font-sans text-white">
      <div className="w-full max-w-[440px] flex flex-col gap-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-[28px]">
                lock
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            SecureNotes
          </h1>
          <p className="text-gray-400 text-sm">
            Ihre Gedanken. Sicher verschlüsselt.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card-dark rounded-2xl shadow-xl border border-border-dark overflow-hidden">
          {/* Tabs */}
          <div className="p-2 border-b border-border-dark bg-[#131920]">
            <div className="flex p-1 bg-input-dark rounded-lg relative">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 text-center cursor-pointer relative z-10 py-2 text-sm font-medium transition-colors rounded-md ${
                  mode === "login"
                    ? "text-white bg-primary shadow-lg ring-1 ring-white/10 font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Einloggen
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 text-center cursor-pointer relative z-10 py-2 text-sm font-medium transition-colors rounded-md ${
                  mode === "register"
                    ? "text-white bg-primary shadow-lg ring-1 ring-white/10 font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Anmelden
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-900/20 p-4 border border-red-900/30 text-red-400 text-sm flex items-start">
                <span className="material-symbols-outlined text-lg mr-2">
                  error
                </span>
                {error}
              </div>
            )}

            {success ? (
              <div className="rounded-lg bg-green-900/10 p-4 border border-green-900/30">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="material-symbols-outlined text-green-500 text-[20px]">
                      mark_email_read
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-400">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">


                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-medium text-gray-300"
                    htmlFor="email"
                  >
                    E-Mail-Adresse
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@beispiel.de"
                    className="block w-full rounded-lg border-border-dark bg-input-dark text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-4 placeholder-gray-500 transition-colors outline-none border focus:ring-1"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-medium text-gray-300"
                    htmlFor="password"
                  >
                    Passwort
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="block w-full rounded-lg border-border-dark bg-input-dark text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 pl-4 pr-10 placeholder-gray-500 transition-colors outline-none border focus:ring-1"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={
                        mode === "login" ? "••••••••" : "Mindestens 8 Zeichen"
                      }
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

                  {mode === "login" && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setIsResetModalOpen(true)}
                        className="text-sm text-primary hover:text-blue-400 transition-colors"
                      >
                        Passwort vergessen?
                      </button>
                    </div>
                  )}

                  {mode === "register" && formData.password && (
                    <div className="pt-2">
                      <div className="flex gap-2 h-1.5 mb-2">
                        <div
                          className={`flex-1 rounded-full transition-colors ${
                            strength > 0 ? strengthInfo.bar : "bg-gray-700"
                          }`}
                        ></div>
                        <div
                          className={`flex-1 rounded-full transition-colors ${
                            strength > 1 ? strengthInfo.bar : "bg-gray-700"
                          }`}
                        ></div>
                        <div
                          className={`flex-1 rounded-full transition-colors ${
                            strength > 2 ? strengthInfo.bar : "bg-gray-700"
                          }`}
                        ></div>
                        <div
                          className={`flex-1 rounded-full transition-colors ${
                            strength > 3 ? strengthInfo.bar : "bg-gray-700"
                          }`}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`${strengthInfo.color} font-medium`}>
                          {strengthInfo.label}
                        </span>
                        <span className="text-gray-500">
                          8+ Zeichen, A-Z, a-z, 0-9, Sonderzeichen
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <a
                  href={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/login/google`}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-transparent rounded-lg shadow-sm bg-white text-sm font-bold text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    ></path>
                  </svg>
                  <span>Mit Google anmelden</span>
                </a>

                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center"
                  >
                    <div className="w-full border-t border-border-dark"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card-dark text-gray-400 text-xs uppercase font-medium tracking-wider">
                      Oder
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Lädt..."
                    : mode === "login"
                    ? "Einloggen"
                    : "Konto erstellen"}
                </button>
              </form>
            )}

            {success && (
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Keine E-Mail erhalten?{" "}
                  <button
                    onClick={() => setSuccess("")}
                    className="font-medium text-primary hover:text-blue-400 transition-colors"
                  >
                    Zurück zur Anmeldung
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#131920] border-t border-border-dark text-center">
            <p className="text-xs text-gray-500">
              Mit der Anmeldung akzeptieren Sie unsere{" "}
              <a className="underline hover:text-gray-300" href="#">
                AGB
              </a>{" "}
              und{" "}
              <a className="underline hover:text-gray-300" href="/datenschutz">
                Datenschutzrichtlinie
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Passwort zurücksetzen"
      >
        <form onSubmit={handlePasswordReset} className="space-y-5">
          {resetMsg && (
            <div className="text-sm p-3 bg-blue-900/20 border border-blue-900/40 text-blue-300 rounded-lg flex gap-2">
              <span className="material-symbols-outlined text-[20px]">
                info
              </span>
              {resetMsg}
            </div>
          )}

          <p className="text-sm text-gray-400">
            Geben Sie die E-Mail-Adresse ein, die mit Ihrem Konto verknüpft ist.
            Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              E-Mail Adresse
            </label>
            <Input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="ihre@email.de"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
          >
            Link anfordern
          </button>
        </form>
      </Modal>

      {/* Reset Password Toast */}
      {showResetToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 animate-pulse">
          E-Mail gesendet! Bitte überprüfen Sie Ihren Posteingang.
        </div>
      )}
    </div>
  );
};
