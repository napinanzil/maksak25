import React from 'react';
import { View } from '../App';

const PingPongIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-mak-gold" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.59V15H9v-2h2v-2.59l-4.71-4.71 1.42-1.42L12 8.59l4.29-4.3 1.42 1.42L13 10.41V13h2v2h-2v2.59l4.71 4.71-1.42 1.42L12 19.41l-4.29 4.3-1.42-1.42L11 17.59z"/>
    </svg>
);

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

const navLinks: { view: View; label: string }[] = [
    { view: 'setup', label: 'Daftar Pasukan' },
    { view: 'schedule', label: 'Jadual & Carta' },
    { view: 'lineup', label: 'Slip Perlawanan' },
    { view: 'resultsEntry', label: 'Isi Keputusan' },
    { view: 'groupResultsEntry', label: 'Isi Keputusan Kumpulan' },
    { view: 'resultsSummary', label: 'Papan Markah' },
    { view: 'groupResults', label: 'Keputusan Kumpulan' },
];

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const navLinkClasses = "py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap";
  const activeLinkClasses = "bg-mak-gold text-mak-blue";
  const inactiveLinkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <header className="bg-mak-blue shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="py-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between">
            <div className="flex items-center justify-center space-x-4">
                <PingPongIcon />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wider text-center">
                    MAKSAK 2025: Ping Pong
                </h1>
            </div>
            <nav className="flex flex-wrap justify-center space-x-1 sm:space-x-2 mt-4 sm:mt-0 bg-gray-800/50 p-1 rounded-lg">
                {navLinks.map(({ view, label }) => (
                     <button 
                        key={view}
                        onClick={() => onNavigate(view)}
                        className={`${navLinkClasses} ${currentView === view ? activeLinkClasses : inactiveLinkClasses}`}
                    >
                        {label}
                    </button>
                ))}
            </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
