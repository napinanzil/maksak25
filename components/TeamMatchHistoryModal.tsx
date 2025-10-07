import React from 'react';

interface TeamMatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string | null;
  matches: any[];
  onSelectMatchDetails: (match: any) => void;
}

const TeamMatchHistoryModal: React.FC<TeamMatchHistoryModalProps> = ({ isOpen, onClose, teamName, matches, onSelectMatchDetails }) => {
  if (!isOpen || !teamName) return null;

  const teamMatches = matches.filter(match => match.team1 === teamName || match.team2 === teamName);

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
            <h2 className="text-xl font-bold text-mak-gold">Sejarah Perlawanan</h2>
            <p className="text-sm text-gray-400">{teamName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6">
          {teamMatches.length === 0 ? (
            <p className="text-center text-gray-400">Tiada sejarah perlawanan untuk pasukan ini.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Lawan</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300">Keputusan</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300">Skor (Menang - Kalah)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 bg-gray-800">
                  {teamMatches.map((match, index) => {
                    const isTeam1 = match.team1 === teamName;
                    const opponent = isTeam1 ? match.team2 : match.team1;
                    const teamScore = isTeam1 ? match.team1CategoryWins : match.team2CategoryWins;
                    const opponentScore = isTeam1 ? match.team2CategoryWins : match.team1CategoryWins;
                    const isWinner = teamScore > opponentScore;
                    const resultText = isWinner ? 'Menang' : 'Kalah';

                    return (
                      <tr 
                        key={index} 
                        onClick={() => onSelectMatchDetails(match)}
                        className="cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
                        title={`Lihat butiran perlawanan menentang ${opponent}`}
                      >
                        <td className="py-3 px-4 text-sm text-gray-200">{opponent}</td>
                        <td className={`py-3 px-4 text-center text-sm font-bold ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                          {resultText}
                        </td>
                        <td className="py-3 px-4 text-center text-lg font-mono">
                          <span className={`font-bold ${isWinner ? 'text-mak-gold' : 'text-gray-300'}`}>{teamScore}</span>
                          <span className="text-gray-500 mx-1">-</span>
                          <span className="text-gray-300">{opponentScore}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeamMatchHistoryModal;