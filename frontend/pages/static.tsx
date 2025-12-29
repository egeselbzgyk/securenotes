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
      <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
      
      <div className="bg-[#182029] p-6 rounded-xl border border-[#323b47]">
        <h3 className="text-xl font-bold mb-4 text-white">Verantwortlicher</h3>
        <p className="text-gray-400">SecureNotes GmbH<br/>Musterstraße 1<br/>12345 Berlin</p>
      </div>

      <h3 className="text-xl font-bold mt-8 text-white">Datenerfassung</h3>
      <p>Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis.</p>
    </div>
  </StaticLayout>
);

export const Impressum: React.FC = () => (
  <StaticLayout title="Impressum">
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#182029] p-6 rounded-xl border border-[#323b47]">
            <h3 className="text-lg font-bold mb-2 text-white">Angaben gemäß § 5 TMG</h3>
            <p className="text-gray-400">SecureNotes GmbH<br/>Musterstraße 1<br/>12345 Berlin</p>
            <p className="text-gray-400 mt-2">Handelsregister: HRB 12345<br/>Registergericht: Amtsgericht Berlin-Charlottenburg</p>
        </div>
        
        <div className="bg-[#182029] p-6 rounded-xl border border-[#323b47]">
            <h3 className="text-lg font-bold mb-2 text-white">Kontakt</h3>
            <p className="text-gray-400">Telefon: +49 123 45678<br/>E-Mail: info@securenotes.example</p>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mt-8 text-white">Haftung für Inhalte</h3>
      <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
    </div>
  </StaticLayout>
);