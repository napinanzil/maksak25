import React, { useState } from 'react';
import { Team, Results } from '../types';
import { EVENTS } from '../constants';
import BracketModal from './BracketModal';
import { generateSchedule } from '../utils/scheduleGenerator';
import MatchDetailsModal from './MatchDetailsModal';

interface TournamentScheduleProps {
  teams: Team[];
  results: Results;
}

const TournamentSchedule: React.FC<TournamentScheduleProps> = ({ teams, results }) => {
  const [isBracketVisible, setIsBracketVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  
  const teamNames = teams.map(t => t.name);
  const schedule = generateSchedule(teamNames);

  const teamPlayersMap = new Map<string, Team>(teams.map(team => [team.name, team]));

  const getPlayerForEvent = (teamName: string, event: string): string => {
    const team = teamPlayersMap.get(teamName);
    const players = team?.players[event] || [];
    const validPlayers = players.filter(p => p && p.trim() !== '');
    if (validPlayers.length === 0) return 'N/A';
    return validPlayers.join(' & ');
  };
  
  const handlePrint = () => {
    window.print();
  };

  let matchCounter = 1;

  return (
    <>
      <BracketModal 
        isOpen={isBracketVisible} 
        onClose={() => setIsBracketVisible(false)} 
        teams={teams} 
      />
      <MatchDetailsModal 
        isOpen={!!selectedMatch} 
        onClose={() => setSelectedMatch(null)} 
        match={selectedMatch}
        results={results}
      />
      <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl animate-fade-in print-container">
        <style>
          {`
            @media print {
              body { background-color: white !important; color: black !important; }
              main, .print-container { padding: 0 !important; margin: 0 !important; box-shadow: none !important; background-color: white !important; }
              .no-print { display: none !important; }
              .print-event-card { page-break-inside: avoid; margin-bottom: 2rem; }
              .print-table { color: black !important; }
              .print-table th, .print-table td { border-color: #ddd !important; }
              .print-table thead { background-color: #f2f2f2 !important; }
              .print-header { color: black !important; }
            }
          `}
        </style>

        <div className="no-print flex flex-col sm:flex-row justify-between items-center mb-6 border-b-2 border-mak-gold pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-mak-gold">Jadual Pertandingan</h2>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-4 sm:mt-0">
            <button
                onClick={() => setIsBracketVisible(true)}
                className="bg-mak-blue hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M15 4a1 1 0 00-1-1H6a1 1 0 00-1 1v2H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V7a1 1 0 00-1-1h-1V4zM9 9v2H7V9h2zm4 0v2h-2V9h2zM9 6v2H7V6h2zm4 0v2h-2V6h2z" /></svg>
              Carta Aliran
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h8a1 1 0 011 1v4h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
              Cetak
            </button>
          </div>
        </div>
        
        {schedule.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Tidak cukup pasukan untuk menjana jadual.</p>
        ) : (
          <div className="space-y-12">
            {EVENTS.map(event => (
              <div key={event} className="print-event-card">
                <h3 className="text-xl sm:text-2xl font-semibold text-mak-blue mb-4 print-header">{event}</h3>
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="min-w-full divide-y divide-gray-700 print-table">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-mak-gold sm:pl-6 w-12">No.</th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-mak-gold">Pusingan</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-mak-gold w-2/5">Pasukan A</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-center w-4">vs</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-mak-gold w-2/5">Pasukan B</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50 bg-gray-800">
                      {schedule.flatMap((round, roundIndex) =>
                        round.map((match, matchIndex) => {
                          const isByeMatch = !match.team2;
                          return (
                            <tr 
                              key={`${event}-${roundIndex}-${matchIndex}`} 
                              className={`hover:bg-gray-700/50 ${!isByeMatch && 'cursor-pointer'}`}
                              onClick={() => {
                                if (isByeMatch) return;
                                setSelectedMatch({
                                  ...match,
                                  round: roundIndex + 1,
                                  roundIndex: roundIndex,
                                });
                              }}
                            >
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-center font-medium text-white sm:pl-6">{matchCounter++}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-300">{roundIndex + 1}</td>
                              <td className="px-3 py-4 text-sm text-gray-300">
                                <div className="font-medium text-white">{match.team1}</div>
                                <div className="text-xs text-gray-400 mt-1">{getPlayerForEvent(match.team1, event)}</div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">vs</td>
                              <td className="px-3 py-4 text-sm text-gray-300">
                                {isByeMatch ? (
                                  <span className="text-mak-gold/80 font-semibold">BYE</span>
                                ) : (
                                  <>
                                    <div className="font-medium text-white">{match.team2}</div>
                                    <div className="text-xs text-gray-400 mt-1">{getPlayerForEvent(match.team2!, event)}</div>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TournamentSchedule;