import React from "react";
import { Modal, Input, Button } from "../ui";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  resetEmail: string;
  resetMsg: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  resetEmail,
  resetMsg,
  onEmailChange,
  onSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Passwort zurücksetzen">
      <form onSubmit={onSubmit} className="space-y-5">
        {resetMsg && (
          <div className="text-sm p-3 bg-blue-900/20 border border-blue-900/40 text-blue-300 rounded-lg flex gap-2">
            <span className="material-symbols-outlined text-[20px]">info</span>
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
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="ihre@email.de"
          />
        </div>
        <Button type="submit" className="w-full">
          Link anfordern
        </Button>
      </form>
    </Modal>
  );
};
