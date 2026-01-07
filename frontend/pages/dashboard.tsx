import React, { useState, useEffect } from "react";
import { useAuth } from "../auth-context";
import { NotesApi, Note } from "../api";
import { Navbar } from "../components/dashboard/Navbar";
import { Sidebar } from "../components/dashboard/Sidebar";
import { NoteEditor } from "../components/dashboard/NoteEditor";
import { ApiKeyManager } from "../components/dashboard/ApiKeyManager";
import { useRouter } from "../router";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { path, navigate } = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [filter, setFilter] = useState<"own" | "public">("own");
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isNewNote, setIsNewNote] = useState(false);

  // Parse search from URL
  const getSearchFromUrl = () => {
    try {
      const [_, queryString] = path.split("?");
      const params = new URLSearchParams(queryString);
      return params.get("search") || "";
    } catch {
      return "";
    }
  };

  const searchQuery = getSearchFromUrl();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isApiManagerOpen, setIsApiManagerOpen] = useState(false);

  // Copy toast state
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Note editing state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMode, setEditMode] = useState<"edit" | "preview">("preview");
  const [isDirty, setIsDirty] = useState(false);

  // Load notes when filter or search changes
  useEffect(() => {
    loadNotes();
  }, [filter, searchQuery]);

  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title || "");
      setEditContent(selectedNote.content || "");
      // If not owner, force preview
      if (selectedNote.authorId && selectedNote.authorId !== user?.id) {
        setEditMode("preview");
      } else {
        setEditMode("edit");
      }
      setIsDirty(false);
    } else {
      setEditTitle("");
      setEditContent("");
      setIsNewNote(false);
    }
  }, [selectedNote, user?.id]);

  const loadNotes = async () => {
    try {
      const data = await NotesApi.list({ search: searchQuery, filter });
      setNotes(data || []);
    } catch (e) {
      console.error(e);
      setNotes([]);
    }
  };

  const handleSearch = (term: string) => {
    const trimmed = term.trim();
    const currentBase = path.split("?")[0];
    if (trimmed) {
      const params = new URLSearchParams();
      params.set("search", trimmed);
      navigate(`${currentBase}?${params.toString()}`);
    } else {
      navigate(currentBase);
    }
  };

  const handleNoteSelect = async (noteLite: Note) => {
    // Optimistic set (titles etc)
    setSelectedNote(noteLite);
    setIsLoadingNote(true);
    try {
      // Fetch full content
      const fullNote = await NotesApi.get(noteLite.id);
      setSelectedNote(fullNote);
    } catch (e) {
      console.error("Failed to load note content");
    } finally {
      setIsLoadingNote(false);
    }
  };

  const handleCreateNote = () => {
    // Create a temporary note object for editing
    const tempNote: Note = {
      id: "new",
      title: "Neue Notiz",
      content: "",
      visibility: "PRIVATE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: user?.id,
    };
    setSelectedNote(tempNote);
    setIsNewNote(true);
    setEditMode("edit");
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    try {
      if (isNewNote) {
        // Create new note
        const newNote = await NotesApi.create({
          title: editTitle,
          content: editContent,
          visibility: "PRIVATE",
        });
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
        setIsNewNote(false);
      } else {
        // Update existing note
        const updated = await NotesApi.update(selectedNote.id, {
          title: editTitle,
          content: editContent,
        });
        setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
        setSelectedNote(updated);
      }
      setIsDirty(false);
    } catch (e) {
      alert("Fehler beim Speichern");
    }
  };

  const handleDelete = async () => {
    if (!selectedNote || !window.confirm("Notiz wirklich löschen?")) return;
    try {
      if (isNewNote) {
        // Just clear the new note without calling API
        setSelectedNote(null);
        setIsNewNote(false);
      } else {
        await NotesApi.delete(selectedNote.id);
        setNotes(notes.filter((n) => n.id !== selectedNote.id));
        setSelectedNote(null);
      }
    } catch (e) {
      alert("Fehler beim Löschen");
    }
  };

  const toggleVisibility = async () => {
    if (!selectedNote || isNewNote) return;
    try {
      const newVisibility =
        selectedNote.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
      const updated = await NotesApi.update(selectedNote.id, {
        visibility: newVisibility,
      });
      setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
      setSelectedNote(updated);
    } catch (e) {
      alert("Fehler");
    }
  };

  const handleShareNote = async () => {
    if (!selectedNote || isNewNote) return;
    const shareUrl = `${window.location.origin}/#/note/${selectedNote.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  // Helper to check ownership. Backend provides authorId.
  const isOwner =
    isNewNote ||
    selectedNote?.authorId === user?.id ||
    (!selectedNote?.authorId && filter === "own");
  const isPublic = selectedNote?.visibility === "PUBLIC";

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-sans">
      <Navbar
        userEmail={user?.email}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onLogout={logout}
        onOpenApiManager={() => setIsApiManagerOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNote?.id || null}
          search={searchQuery}
          onSearchChange={handleSearch}
          filter={filter}
          onFilterChange={setFilter}
          onCreateNote={handleCreateNote}
          onNoteSelect={handleNoteSelect}
        />

        <main className="flex-1 flex flex-col bg-[#111821] relative">
          <NoteEditor
            selectedNote={selectedNote}
            isLoadingNote={isLoadingNote}
            editTitle={editTitle}
            editContent={editContent}
            editMode={editMode}
            isOwner={isOwner}
            isPublic={isPublic}
            isDirty={isDirty}
            onTitleChange={(value) => {
              setEditTitle(value);
              setIsDirty(true);
            }}
            onContentChange={(value) => {
              setEditContent(value);
              setIsDirty(true);
            }}
            onEditModeChange={setEditMode}
            onSave={handleSave}
            onShare={handleShareNote}
            onToggleVisibility={toggleVisibility}
            onDelete={handleDelete}
          />
        </main>
      </div>

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 animate-pulse">
          Link in die Zwischenablage kopiert!
        </div>
      )}

      {/* API Key Manager Modal */}
      <ApiKeyManager
        isOpen={isApiManagerOpen}
        onClose={() => setIsApiManagerOpen(false)}
      />
    </div>
  );
};
