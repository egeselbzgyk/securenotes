import React, { useEffect, useState } from "react";
import { NotesApi, Note } from "../api";
import { useRouter } from "../router";

export const SharedNote: React.FC = () => {
  const { path, navigate } = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract note ID from path: /note/{id}
  const noteId = path.split("/")[2];

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) {
        setError("Notiz-ID nicht gefunden");
        setLoading(false);
        return;
      }

      try {
        const data = await NotesApi.get(noteId);
        setNote(data);
        setLoading(false);
      } catch {
        setError("Notiz nicht gefunden oder kein Zugriff");
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111821] flex items-center justify-center">
        <div className="text-gray-500">Lade Notiz...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[#111821] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1c2430] flex items-center justify-center mb-4 border border-border-dark">
          <span className="material-symbols-outlined text-3xl text-red-400">
            error
          </span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Fehler</h1>
        <p className="text-gray-400 text-center max-w-md">
          {error || "Notiz nicht gefunden"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium"
        >
          Zurück zum Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111821] flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border-dark flex items-center justify-between px-4 bg-[#131920]">
        <div className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">lock</span>
          SecureNotes
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Zurück zum Dashboard
        </button>
      </header>

      {/* Note Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-8">
        <div className="bg-[#1c2430] border border-border-dark rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-4">
            {note.title || "Unbenannt"}
          </h1>

          <div className="flex items-center gap-4 mb-6 text-xs text-gray-500">
            <span>
              Erstellt:{" "}
              {new Date(note.createdAt).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
            <span>
              Zuletzt bearbeitet:{" "}
              {new Date(note.updatedAt).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
            {note.visibility === "PUBLIC" && (
              <span className="flex items-center gap-1 text-blue-400">
                <span className="material-symbols-outlined text-[14px]">
                  public
                </span>
                Öffentlich
              </span>
            )}
          </div>

          <div className="border-t border-border-dark pt-6">
            {note.htmlContent ? (
              <div
                className="prose prose-invert max-w-none text-gray-300 prose-headings:text-white prose-a:text-primary prose-strong:text-white prose-code:text-primary prose-pre:bg-[#1c2430] prose-pre:border prose-pre:border-border-dark"
                dangerouslySetInnerHTML={{ __html: note.htmlContent }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-gray-300">
                {note.content || (
                  <span className="text-gray-600 italic">
                    Diese Notiz hat noch keinen Inhalt.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
