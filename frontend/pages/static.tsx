import React from 'react';
import { Link } from '../router';

const StaticLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-[#111821] text-white">
    <header className="h-14 border-b border-[#323b47] flex items-center px-4 bg-[#131920]">
      <Link to="/" className="font-bold text-lg text-white mr-8 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">lock</span>
        SecureNotes
      </Link>
      <nav className="flex space-x-6 text-sm text-gray-400">
        <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
        <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
      </nav>
    </header>
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-white tracking-tight">{title}</h1>
      <div className="prose prose-invert max-w-none text-gray-300">
        {children}
      </div>
    </main>
  </div>
);

export const Datenschutz: React.FC = () => (
  <StaticLayout title="Datenschutzerklärung">
    <div className="space-y-6">
      <p className="text-gray-400">
        Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Diese
        Datenschutzerklärung informiert darüber, welche personenbezogenen Daten
        im Rahmen dieses nicht-kommerziellen Studienprojekts verarbeitet werden
        und zu welchem Zweck.
      </p>

      <div className="bg-[#182029] p-6 rounded-xl border border-[#323b47]">
        <h3 className="text-xl font-bold mb-4 text-white">Verantwortlicher</h3>
        <p className="text-gray-400">
          SecureNotes – Studienprojekt<br />
          Technische Hochschule Mittelhessen (THM)<br />
          Verantwortliche Studierende:<br />
          Bozgeyik, Egesel<br />
          Usal, Osman Ali<br />
          E-Mail: egesel.bozgeyik@thm.de
        </p>
      </div>

      <h3 className="text-xl font-bold mt-8 text-white">
        Verarbeitung personenbezogener Daten
      </h3>
      <p className="text-gray-400">
        Im Rahmen der Nutzung der Anwendung können personenbezogene Daten wie
        E-Mail-Adresse und Anmeldeinformationen verarbeitet
        werden. Die Verarbeitung erfolgt ausschließlich zu Lehr- und
        Demonstrationszwecken im Rahmen eines Hochschulprojekts.
      </p>

      <h3 className="text-xl font-bold mt-8 text-white">
        Zweck der Datenverarbeitung
      </h3>
      <p className="text-gray-400">
        Die Verarbeitung der Daten dient ausschließlich der Bereitstellung der
        Funktionen der Anwendung, insbesondere der Benutzeranmeldung und der
        Nutzung der Notizfunktionen.
      </p>

      <h3 className="text-xl font-bold mt-8 text-white">
        Weitergabe von Daten
      </h3>
      <p className="text-gray-400">
        Eine Weitergabe personenbezogener Daten an Dritte erfolgt nicht. Die
        Daten werden nicht zu kommerziellen Zwecken genutzt.
      </p>

      <h3 className="text-xl font-bold mt-8 text-white">
        Speicherdauer
      </h3>
      <p className="text-gray-400">
        Personenbezogene Daten werden nur so lange gespeichert, wie dies für den
        Betrieb der Anwendung im Rahmen des Studienprojekts erforderlich ist.
        Nach Abschluss des Projekts werden die Daten gelöscht.
      </p>

      <h3 className="text-xl font-bold mt-8 text-white">
        Rechte der betroffenen Personen
      </h3>
      <p className="text-gray-400">
        Betroffene Personen haben im Rahmen der geltenden gesetzlichen
        Bestimmungen das Recht auf Auskunft über die sie betreffenden
        personenbezogenen Daten, deren Berichtigung oder Löschung sowie die
        Einschränkung der Verarbeitung.
      </p>

      <h3 className="text-xl font-bold mt-8 text-white">
        Hinweis zum Projektcharakter
      </h3>
      <p className="text-gray-400">
        Diese Anwendung ist kein dauerhaft betriebener Online-Dienst und dient
        ausschließlich der Lehre. Es besteht kein Anspruch auf Verfügbarkeit
        oder dauerhafte Datenspeicherung.
      </p>
    </div>
  </StaticLayout>
);

export const Impressum: React.FC = () => (
  <StaticLayout title="Impressum">
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#182029] p-6 rounded-xl border border-[#323b47]">
          <h3 className="text-lg font-bold mb-2 text-white">
            Angaben gemäß § 5 TMG
          </h3>
          <p className="text-gray-400">
            SecureNotes<br />
            Nicht-kommerzielles Studienprojekt<br />
            Technische Hochschule Mittelhessen (THM)
          </p>
          <p className="text-gray-400 mt-2">
            Projektverantwortliche Studierende:<br />
            Bozgeyik, Egesel<br />
            Usal, Osman Ali
          </p>
        </div>

        <div className="bg-[#182029] p-6 rounded-xl border border-[#323b47]">
          <h3 className="text-lg font-bold mb-2 text-white">Kontakt</h3>
          <p className="text-gray-400">
            E-Mail: egesel.bozgeyik@thm.de
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 text-white">Haftung für Inhalte</h3>
      <p className="text-gray-400">
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis
        10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte
        fremde Informationen zu überwachen oder nach Umständen zu forschen, die
        auf eine rechtswidrige Tätigkeit hinweisen.
      </p>

      <h3 className="text-xl font-bold mt-8 text-white">
        Hinweis zum Projektcharakter
      </h3>
      <p className="text-gray-400">
        Diese Webanwendung dient ausschließlich Lehr- und Demonstrationszwecken
        im Rahmen eines Hochschulprojekts. Es handelt sich nicht um ein
        kommerzielles Produkt. Es besteht kein Anspruch auf Verfügbarkeit,
        Vollständigkeit oder Fehlerfreiheit.
      </p>
    </div>
  </StaticLayout>
);
