import React from "react";
import { Link } from "../../router";

interface NavbarProps {
  userEmail?: string;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onLogout: () => void;
  onOpenApiManager: () => void;
}

const IconUser = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  userEmail,
  isMenuOpen,
  onMenuToggle,
  onLogout,
  onOpenApiManager,
}) => {
  return (
    <header className="h-14 border-b border-border-dark flex items-center justify-between px-4 bg-[#131920] z-10 shadow-sm">
      <div className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">lock</span>
        SecureNotes
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">{userEmail}</span>
        <div className="relative">
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-full hover:bg-input-dark text-gray-400 hover:text-white transition-colors"
          >
            <IconUser />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card-dark border border-border-dark rounded-lg shadow-xl py-1 text-sm text-gray-300 z-50">
              <Link
                to="/datenschutz"
                className="block px-4 py-2.5 hover:bg-input-dark hover:text-white transition-colors"
              >
                Datenschutz
              </Link>
              <Link
                to="/impressum"
                className="block px-4 py-2.5 hover:bg-input-dark hover:text-white transition-colors"
              >
                Impressum
              </Link>
              <button
                onClick={() => {
                  onMenuToggle();
                  onOpenApiManager();
                }}
                className="block w-full text-left px-4 py-2.5 hover:bg-input-dark hover:text-white transition-colors"
              >
                API Schlüssel
              </button>
              <div className="border-t border-border-dark my-1"></div>
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2.5 hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-colors"
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
