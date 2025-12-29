import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui";
import { Note } from "../../api";

interface NoteEditorProps {
  selectedNote: Note | null;
  isLoadingNote: boolean;
  editTitle: string;
  editContent: string;
  editMode: "edit" | "preview";
  isOwner: boolean;
  isPublic: boolean;
  isDirty: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onEditModeChange: (mode: "edit" | "preview") => void;
  onSave: () => void;
  onShare: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  selectedNote,
  isLoadingNote,
  editTitle,
  editContent,
  editMode,
  isOwner,
  isPublic,
  isDirty,
  onTitleChange,
  onContentChange,
  onEditModeChange,
  onSave,
  onShare,
  onToggleVisibility,
  onDelete,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  if (!selectedNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
        <div className="w-16 h-16 rounded-2xl bg-[#1c2430] flex items-center justify-center mb-4 border border-border-dark">
          <span className="material-symbols-outlined text-3xl opacity-50">
            edit_note
          </span>
        </div>
        <p className="text-lg font-medium text-gray-400">
          Keine Notiz ausgewählt
        </p>
        <p className="text-sm mt-2 max-w-xs text-center">
          Wähle eine Notiz aus der Liste links oder erstelle eine neue Notiz, um
          zu beginnen.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Note Header */}
      <div className="h-16 border-b border-border-dark flex items-center px-6 justify-between bg-[#111821]">
        <div className="flex-1 mr-4">
          {isOwner ? (
            <input
              className="text-xl font-bold bg-transparent text-white border-none focus:ring-0 w-full placeholder-gray-600 p-0"
              value={editTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Titel der Notiz"
            />
          ) : (
            <h2 className="text-xl font-bold text-white">
              {selectedNote.title}
            </h2>
          )}

          <div className="text-xs text-gray-500 mt-1">
            Zuletzt bearbeitet:{" "}
            {new Date(selectedNote.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isOwner && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c2430] border border-border-dark rounded-full">
              <span className="material-symbols-outlined text-gray-400 text-[16px]">
                lock
              </span>
              <span className="text-gray-400 text-xs font-medium">
                Schreibgeschützt
              </span>
            </div>
          )}

          {isOwner && (
            <>
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium transition-colors"
                title="Link kopieren"
              >
                <span className="material-symbols-outlined text-[14px]">
                  link
                </span>
                Teilen
              </button>
              <button
                onClick={onToggleVisibility}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  isPublic
                    ? "bg-blue-900/20 border-blue-800 text-blue-400 hover:bg-blue-900/30"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {isPublic ? (
                  <>
                    <span className="material-symbols-outlined text-[14px]">
                      public
                    </span>
                    Öffentlich
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">
                      lock
                    </span>
                    Privat
                  </>
                )}
              </button>

              <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="p-2 hover:bg-[#1c2430] rounded-full text-gray-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-card-dark border border-border-dark rounded-lg shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={onDelete}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                      Löschen
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 border-b border-border-dark bg-[#111821] flex items-center">
        <div className="flex space-x-6">
          {isOwner && (
            <button
              className={`text-sm font-medium py-3 border-b-2 transition-colors ${
                editMode === "edit"
                  ? "text-primary border-primary"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
              onClick={() => onEditModeChange("edit")}
            >
              Bearbeiten
            </button>
          )}
          <button
            className={`text-sm font-medium py-3 border-b-2 transition-colors ${
              editMode === "preview"
                ? "text-primary border-primary"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
            onClick={() => onEditModeChange("preview")}
          >
            Vorschau
          </button>
        </div>

        <div className="flex-1"></div>

        {isOwner && isDirty && (
          <Button onClick={onSave} className="my-2 py-1 px-4 text-xs h-8 ml-4">
            Speichern
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        {isLoadingNote ? (
          <div className="text-gray-500 text-sm">Lade Inhalt...</div>
        ) : (
          <>
            {editMode === "edit" ? (
              <textarea
                className="w-full h-full resize-none outline-none bg-transparent text-gray-300 font-mono text-sm leading-relaxed placeholder-gray-700"
                value={editContent}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder="# Titel der Notiz&#10;&#10;Schreibe hier deine Gedanken..."
                spellCheck={false}
              />
            ) : (
              <div className="prose prose-invert max-w-none text-gray-300 prose-headings:text-white prose-a:text-primary prose-strong:text-white prose-code:text-primary prose-pre:bg-[#1c2430] prose-pre:border prose-pre:border-border-dark">
                {selectedNote.htmlContent ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedNote.htmlContent,
                    }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">
                    {editContent || selectedNote.content || (
                      <span className="text-gray-600 italic">
                        Diese Notiz hat noch keinen Inhalt.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
