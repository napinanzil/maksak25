import React from 'react';
import { Team } from '../types';
import { EVENTS } from '../constants';
import { generateSchedule } from '../utils/scheduleGenerator';

interface LineupDisplayProps {
  teams: Team[];
}

const LineupDisplay: React.FC<LineupDisplayProps> = ({ teams }) => {
  const teamNames = teams.map(t => t.name);
  const schedule = generateSchedule(teamNames);
  const teamDataMap = new Map<string, Team>(teams.map(team => [team.name, team]));

  const getPlayerForEvent = (teamName: string, event: string): string => {
    const team = teamDataMap.get(teamName);
    const players = team?.players[event] || [];
    const validPlayers = players.filter(p => p && p.trim() !== '');
    if (validPlayers.length === 0) return 'N/A';
    return validPlayers.join(' & ');
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  let matchCounter = 0;

  return (
    <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl animate-fade-in print-container">
      <style>
        {`
          @media print {
            body { 
                background-color: white !important; 
                color: black !important; 
            }
            main, .print-container { 
                padding: 0 !important; 
                margin: 0 !important; 
                box-shadow: none !important; 
                background-color: white !important;
            }
            .no-print { display: none !important; }
            .print-grid {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 1rem !important;
            }
            .print-card {
                page-break-inside: avoid !important;
                border: 1px solid #ccc !important;
                background-color: #fff !important;
            }
            .print-event-title, .print-team-name {
                color: black !important;
            }
            .print-player-name {
                 color: #333 !important;
            }
            .print-only {
                display: block !important;
            }
          }
          .print-only { display: none; }
        `}
      </style>
      
      <div className="no-print flex flex-col sm:flex-row justify-between items-center mb-6 border-b-2 border-mak-gold pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-mak-gold">Slip Perlawanan</h2>
        <button
          onClick={handlePrint}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center mt-4 sm:mt-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h8a1 1 0 011 1v4h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
          Cetak Semua
        </button>
      </div>
      
      {schedule.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Tidak cukup pasukan untuk menjana senarai pemain.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-grid">
          {EVENTS.flatMap(event => 
            schedule.flatMap((round, roundIndex) => 
              round.map((match, matchIndex) => {
                if (!match.team2) return null; // Skip BYEs
                matchCounter++;
                const team1Players = getPlayerForEvent(match.team1, event);
                const team2Players = getPlayerForEvent(match.team2!, event);
                
                return (
                  <div key={`${event}-${roundIndex}-${matchIndex}`} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col print-card h-full">
                    <div className="flex justify-between items-baseline text-xs text-gray-400 mb-2">
                      <span>Perlawanan #{matchCounter}</span>
                      <span>Pusingan {roundIndex + 1}</span>
                    </div>
                    <h4 className="text-center font-bold text-mak-gold mb-3 print-event-title">{event}</h4>
                    
                    <div className="flex-grow grid grid-cols-11 items-center text-center my-2">
                      <div className="col-span-5 flex flex-col justify-center h-full">
                        <p className="font-semibold text-white text-base truncate print-team-name">{match.team1}</p>
                        <p className="text-gray-300 text-sm mt-1 break-words print-player-name">{team1Players}</p>
                      </div>
                      
                      <div className="col-span-1 text-gray-500 font-bold text-lg">vs</div>
                      
                      <div className="col-span-5 flex flex-col justify-center h-full">
                        <p className="font-semibold text-white text-base truncate print-team-name">{match.team2}</p>
                        <p className="text-gray-300 text-sm mt-1 break-words print-player-name">{team2Players}</p>
                      </div>
                    </div>
                    
                    <div className="print-only mt-6 border-t border-gray-400 pt-2 text-xs">
                        <div className="flex justify-around items-end space-x-2">
                            <div className="w-1/3 text-center mt-2">
                                <div className="border-b border-gray-400 h-6"></div>
                                <p className="text-xxs">Pengadil</p>
                            </div>
                            <div className="w-1/3 text-center mt-2">
                                <div className="border-b border-gray-400 h-6"></div>
                                <p className="text-xxs">Pengurus ({match.team1})</p>
                            </div>
                            <div className="w-1/3 text-center mt-2">
                                <div className="border-b border-gray-400 h-6"></div>
                                <p className="text-xxs">Pengurus ({match.team2})</p>
                            </div>
                        </div>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      )}
    </div>
  );
};

export default LineupDisplay;
