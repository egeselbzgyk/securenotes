import React from "react";
import { Input, Button } from "../ui";
import { Note } from "../../api";

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  filter: "own" | "public";
  onFilterChange: (filter: "own" | "public") => void;
  onCreateNote: () => void;
  onNoteSelect: (note: Note) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNoteId,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onCreateNote,
  onNoteSelect,
}) => {
  return (
    <aside className="w-72 border-r border-border-dark bg-background-dark flex flex-col">
      <div className="p-4 border-b border-border-dark space-y-3 bg-[#131920]">
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500 material-symbols-outlined text-[20px]">
            search
          </span>
          <Input
            placeholder="Notizen durchsuchen..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-input-dark border-border-dark text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex rounded-lg bg-input-dark p-1 border border-border-dark">
          <button
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
              filter === "own"
                ? "bg-card-dark text-white shadow ring-1 ring-white/5"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => onFilterChange("own")}
          >
            Eigene Notizen
          </button>
          <button
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
              filter === "public"
                ? "bg-card-dark text-white shadow ring-1 ring-white/5"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => onFilterChange("public")}
          >
            Öffentliche Notizen
          </button>
        </div>

        {filter === "own" && (
          <Button
            onClick={onCreateNote}
            className="w-full flex justify-center items-center gap-2 py-2 text-sm bg-primary hover:bg-primary-hover border border-transparent"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Neue Notiz
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onNoteSelect(note)}
            className={`p-4 border-b border-border-dark cursor-pointer transition-colors group ${
              selectedNoteId === note.id
                ? "bg-[#1c2430] border-l-4 border-l-primary"
                : "border-l-4 border-l-transparent hover:bg-[#182029]"
            }`}
          >
            <div
              className={`font-medium text-sm mb-1 truncate ${
                selectedNoteId === note.id
                  ? "text-white"
                  : "text-gray-300 group-hover:text-white"
              }`}
            >
              {note.title || "Unbenannt"}
            </div>

            <div className="text-[11px] text-gray-600 flex justify-between items-center mt-1">
              <span>
                {new Date(note.updatedAt).toLocaleDateString("de-DE")}
              </span>
              {note.visibility === "PUBLIC" && (
                <span className="text-xs text-gray-500 material-symbols-outlined text-[14px]">
                  public
                </span>
              )}
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-20">
              note_stack
            </span>
            <span className="text-sm">Keine Notizen gefunden.</span>
          </div>
        )}
      </div>
    </aside>
  );
};
