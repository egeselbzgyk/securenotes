import React, { useState, useEffect } from "react";
import { ApiKey, ApiKeyApi } from "../../api";

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | undefined>(undefined);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("de-DE");
    } catch {
      return "-";
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadKeys();
    } else {
      // Reset state when closed
      setCreatedKey(null);
      setNewKeyName("");
    }
  }, [isOpen]);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const data = await ApiKeyApi.list();
      setKeys(data);
    } catch (e) {
      console.error("Failed to load keys", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const newKey = await ApiKeyApi.create(newKeyName, expiresIn);
      setKeys([newKey, ...keys]);
      setCreatedKey(newKey.key || null); // Save the raw key to display
      setNewKeyName("");
      setExpiresIn(undefined);
    } catch (e) {
      alert("Fehler beim Erstellen des Schlüssels");
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm("Sind Sie sicher? Dieser Schlüssel wird ungültig."))
      return;
    try {
      await ApiKeyApi.revoke(id);
      setKeys(keys.filter((k) => k.id !== id));
    } catch (e) {
      alert("Fehler beim Löschen");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-gray-700 rounded-lg w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            API Schlüssel Verwaltung
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Create Section */}
          <div className="bg-[#0d1117] p-4 rounded-md border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Neuen Schlüssel erstellen
            </h3>
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Name (z.B. Python Script)"
                className="flex-1 bg-[#161b22] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                required
              />
              <select
                value={expiresIn || ""}
                onChange={(e) =>
                  setExpiresIn(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="bg-[#161b22] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="">Unbegrenzt</option>
                <option value="30">30 Tage</option>
                <option value="90">90 Tage</option>
                <option value="365">1 Jahr</option>
              </select>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Erstellen
              </button>
            </form>
          </div>

          {/* Success Message (Only shown once) */}
          {createdKey && (
            <div className="bg-green-900/30 border border-green-500/50 p-4 rounded-md animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-green-400 font-bold text-sm">
                  Schlüssel erstellt!
                </h4>
                <button
                  onClick={() => setCreatedKey(null)}
                  className="text-green-400 hover:text-green-300 text-xs"
                >
                  Schließen
                </button>
              </div>
              <p className="text-gray-300 text-xs mb-2">
                Bitte kopieren Sie diesen Schlüssel jetzt. Er wird{" "}
                <strong>nicht erneut angezeigt</strong>.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 bg-black p-2 rounded text-green-300 font-mono text-sm break-all">
                  {createdKey}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(createdKey)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                >
                  Kopieren
                </button>
              </div>
            </div>
          )}

          {/* Key List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Aktive Schlüssel
            </h3>
            {loading ? (
              <div className="text-gray-500 text-center py-4">Laden...</div>
            ) : keys.length === 0 ? (
              <div className="text-gray-500 text-center py-4 text-sm italic">
                Keine API Schlüssel vorhanden.
              </div>
            ) : (
              <div className="space-y-2">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between bg-[#21262d] p-3 rounded border border-gray-700"
                  >
                    <div>
                      <div className="text-white font-medium text-sm">
                        {key.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Erstellt am: {formatDate(key.createdAt)}
                        {key.expiresAt &&
                          ` • Läuft ab: ${formatDate(key.expiresAt)}`}
                        {key.lastUsedAt &&
                          ` • Zuletzt genutzt: ${formatDate(key.lastUsedAt)}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="text-red-400 hover:text-red-300 text-xs border border-red-900/50 hover:bg-red-900/20 px-3 py-1.5 rounded transition-colors"
                    >
                      Widerrufen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
