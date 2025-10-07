import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { EVENTS } from '../constants';
import TournamentBracket from './TournamentBracket';

interface BracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
}

const BracketModal: React.FC<BracketModalProps> = ({ isOpen, onClose, teams }) => {
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in-fast" 
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-mak-gold">Carta Aliran Pertandingan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-4 border-b border-gray-700">
            <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg">
                {EVENTS.map(event => (
                    <button
                        key={event}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full py-2 px-1 text-sm font-medium rounded-md transition-colors duration-300 ${
                            selectedEvent === event 
                                ? 'bg-mak-blue text-white shadow' 
                                : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        {event}
                    </button>
                ))}
            </div>
        </div>

        <main className="flex-grow p-4 overflow-auto">
            <TournamentBracket key={selectedEvent} teams={teams} event={selectedEvent} />
        </main>
      </div>
    </div>
  );
};

export default BracketModal;