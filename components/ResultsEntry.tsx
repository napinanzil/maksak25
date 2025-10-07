import React from 'react';
import { Team, Results } from '../types';
import { EVENTS } from '../constants';
import { generateSchedule } from '../utils/scheduleGenerator';

interface ResultsEntryProps {
  teams: Team[];
  results: Results;
  onUpdateResult: (matchId: string, team1Score: number | null, team2Score: number | null) => void;
}

const ResultsEntry: React.FC<ResultsEntryProps> = ({ teams, results, onUpdateResult }) => {
  const teamNames = teams.map(t => t.name);
  const schedule = generateSchedule(teamNames);
  
  const handleScoreChange = (
    matchId: string, 
    team: 'team1' | 'team2', 
    value: string
  ) => {
    const currentResult = results[matchId] || { team1Score: null, team2Score: null };
    const score = value === '' ? null : parseInt(value, 10);

    if (team === 'team1') {
      onUpdateResult(matchId, score, currentResult.team2Score);
    } else {
      onUpdateResult(matchId, currentResult.team1Score, score);
    }
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl animate-fade-in">
       <div className="flex justify-between items-center mb-6 border-b-2 border-mak-gold pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-mak-gold">Isi Keputusan Perlawanan</h2>
        </div>
      
      {schedule.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Tidak cukup pasukan untuk menjana jadual.</p>
      ) : (
        <div className="space-y-12">
          {EVENTS.map(event => (
            <div key={event}>
              <h3 className="text-xl sm:text-2xl font-semibold text-mak-blue mb-4">{event}</h3>
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-mak-gold sm:pl-6">Pusingan</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-mak-gold">Pasukan A</th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-mak-gold">Skor A</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-4"></th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-mak-gold">Skor B</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-mak-gold">Pasukan B</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50 bg-gray-800">
                    {schedule.flatMap((round, roundIndex) =>
                      round.map((match, matchIndex) => {
                        if (!match.team2) return null; // Skip BYE matches
                        const matchId = `${event}-${roundIndex}-${match.team1}-vs-${match.team2}`;
                        const result = results[matchId] || { team1Score: null, team2Score: null };
                        return (
                          <tr key={matchId} className="hover:bg-gray-700/50">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{roundIndex + 1}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{match.team1}</td>
                            <td className="px-3 py-4 text-sm">
                              <input
                                type="number"
                                min="0"
                                value={result.team1Score ?? ''}
                                onChange={(e) => handleScoreChange(matchId, 'team1', e.target.value)}
                                className="w-16 bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-center text-white focus:ring-1 focus:ring-mak-gold focus:border-mak-gold"
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">-</td>
                             <td className="px-3 py-4 text-sm">
                              <input
                                type="number"
                                min="0"
                                value={result.team2Score ?? ''}
                                onChange={(e) => handleScoreChange(matchId, 'team2', e.target.value)}
                                className="w-16 bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-center text-white focus:ring-1 focus:ring-mak-gold focus:border-mak-gold"
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{match.team2}</td>
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
  );
};

export default ResultsEntry;
