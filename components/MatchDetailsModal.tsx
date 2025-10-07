import React from 'react';
import { Results } from '../types';
import { EVENTS } from '../constants';

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any | null;
  results: Results;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ isOpen, onClose, match, results }) => {
  if (!isOpen || !match) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in-fast" 
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-mak-gold">Butiran Perlawanan</h2>
            <p className="text-sm text-gray-400">Pusingan {match.round}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6">
          <div className="text-center mb-6">
            <span className={`text-2xl font-bold ${match.team1CategoryWins > match.team2CategoryWins ? 'text-white' : 'text-gray-400'}`}>{match.team1}</span>
            <span className="text-3xl font-bold text-mak-gold mx-4">{match.team1CategoryWins} - {match.team2CategoryWins}</span>
            <span className={`text-2xl font-bold ${match.team2CategoryWins > match.team1CategoryWins ? 'text-white' : 'text-gray-400'}`}>{match.team2}</span>
          </div>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Acara</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300">{match.team1}</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300">{match.team2}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50 bg-gray-800">
                {EVENTS.map(event => {
                  const matchId = `${event}-${match.roundIndex}-${match.team1}-vs-${match.team2}`;
                  const result = results[matchId];
                  const team1Score = result?.team1Score ?? '-';
                  const team2Score = result?.team2Score ?? '-';
                  
                  const isTeam1Winner = typeof result?.team1Score === 'number' && typeof result?.team2Score === 'number' && result.team1Score > result.team2Score;
                  const isTeam2Winner = typeof result?.team1Score === 'number' && typeof result?.team2Score === 'number' && result.team2Score > result.team1Score;

                  return (
                    <tr key={event}>
                      <td className="py-3 px-4 text-sm text-gray-200">{event}</td>
                      <td className={`py-3 px-4 text-center text-lg font-mono ${isTeam1Winner ? 'text-mak-gold font-bold' : 'text-gray-300'}`}>{team1Score}</td>
                      <td className={`py-3 px-4 text-center text-lg font-mono ${isTeam2Winner ? 'text-mak-gold font-bold' : 'text-gray-300'}`}>{team2Score}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MatchDetailsModal;
