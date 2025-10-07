import React from 'react';
import { Team, Results } from '../types';
import { EVENTS } from '../constants';
import { generateSchedule } from '../utils/scheduleGenerator';

interface GroupResultsEntryProps {
  teams: Team[];
  results: Results;
  onUpdateResult: (matchId: string, team1Score: number | null, team2Score: number | null) => void;
}

const GroupResultsEntry: React.FC<GroupResultsEntryProps> = ({ teams, results, onUpdateResult }) => {
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
          <h2 className="text-2xl sm:text-3xl font-bold text-mak-gold">Isi Keputusan (Format Kumpulan)</h2>
          <p className="text-gray-400 text-sm hidden sm:block">Masukkan skor bagi setiap kategori dalam perlawanan.</p>
        </div>
      
      {schedule.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Tidak cukup pasukan untuk menjana jadual.</p>
      ) : (
        <div className="space-y-8">
          {schedule.map((round, roundIndex) => (
            <div key={roundIndex}>
              <h3 className="text-lg font-semibold text-mak-blue mb-4">Pusingan {roundIndex + 1}</h3>
              <div className="space-y-6">
                {round.map((match, matchIndex) => {
                  if (!match.team2) return null; // Skip BYE matches
                  return (
                    <div key={matchIndex} className="bg-gray-700/50 rounded-lg shadow-md overflow-hidden">
                      <div className="p-4 bg-gray-900/50">
                        <h4 className="text-xl font-bold text-center text-white">
                          {match.team1} <span className="text-mak-gold mx-2">vs</span> {match.team2}
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-700/20">
                            <tr>
                              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Acara</th>
                              <th className="py-2 px-4 text-center text-sm font-semibold text-gray-300">Skor ({match.team1})</th>
                              <th className="py-2 px-4 text-center text-sm font-semibold text-gray-300">Skor ({match.team2})</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-600/50">
                            {EVENTS.map(event => {
                              const matchId = `${event}-${roundIndex}-${match.team1}-vs-${match.team2}`;
                              const result = results[matchId] || { team1Score: null, team2Score: null };
                              return (
                                <tr key={event} className="hover:bg-gray-700/40">
                                  <td className="py-3 px-4 text-sm text-gray-200">{event}</td>
                                  <td className="py-2 px-4 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={result.team1Score ?? ''}
                                      onChange={(e) => handleScoreChange(matchId, 'team1', e.target.value)}
                                      className="w-20 bg-gray-800 border border-gray-600 rounded-md py-1 px-2 text-center text-white focus:ring-1 focus:ring-mak-gold focus:border-mak-gold"
                                    />
                                  </td>
                                  <td className="py-2 px-4 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={result.team2Score ?? ''}
                                      onChange={(e) => handleScoreChange(matchId, 'team2', e.target.value)}
                                      className="w-20 bg-gray-800 border border-gray-600 rounded-md py-1 px-2 text-center text-white focus:ring-1 focus:ring-mak-gold focus:border-mak-gold"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupResultsEntry;
