import React, { useMemo, useState } from 'react';
import { Team, Results } from '../types';
import { EVENTS } from '../constants';
import { generateSchedule } from '../utils/scheduleGenerator';

interface ResultsSummaryProps {
  teams: Team[];
  results: Results;
}

type SortKey = 'played' | 'wins' | 'losses' | 'points';

const SortableHeader: React.FC<{
  label: string;
  title: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortOrder: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
}> = ({ label, title, sortKey, currentSortKey, sortOrder, onSort }) => {
  const isActive = sortKey === currentSortKey;
  return (
    <th 
      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:text-mak-gold transition-colors" 
      title={title}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {isActive && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
      </div>
    </th>
  );
};


const ResultsSummary: React.FC<ResultsSummaryProps> = ({ teams, results }) => {
  const [sortConfig, setSortConfig] = useState<{ sortKey: SortKey; sortOrder: 'asc' | 'desc' }>({ sortKey: 'points', sortOrder: 'desc' });

  const teamNames = teams.map(t => t.name);
  const schedule = generateSchedule(teamNames);

  const standingsData = useMemo(() => {
    const eventStandings: Record<string, Record<string, { played: number, wins: number, losses: number, points: number }>> = {};

    EVENTS.forEach(event => {
      const teamStats: Record<string, { played: number, wins: number, losses: number, points: number }> = {};
      teamNames.forEach(name => {
        teamStats[name] = { played: 0, wins: 0, losses: 0, points: 0 };
      });

      schedule.forEach((round, roundIndex) => {
        round.forEach(match => {
          if (!match.team2) return; // Skip BYEs
          
          const matchId = `${event}-${roundIndex}-${match.team1}-vs-${match.team2}`;
          const result = results[matchId];
          
          if (result && typeof result.team1Score === 'number' && typeof result.team2Score === 'number') {
            const { team1, team2 } = match;
            teamStats[team1].played++;
            teamStats[team2].played++;
            
            if (result.team1Score > result.team2Score) {
              teamStats[team1].wins++;
              teamStats[team1].points += 2;
              teamStats[team2].losses++;
            } else if (result.team2Score > result.team1Score) {
              teamStats[team2].wins++;
              teamStats[team2].points += 2;
              teamStats[team1].losses++;
            } 
            // Draws result in no wins, losses, or points for either team.
          }
        });
      });
      
      eventStandings[event] = teamStats;
    });

    return eventStandings;
  }, [teams, results, schedule]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prevConfig => {
      if (prevConfig.sortKey === key) {
        return { ...prevConfig, sortOrder: prevConfig.sortOrder === 'asc' ? 'desc' : 'asc' };
      }
      return { sortKey: key, sortOrder: 'desc' }; // Default to desc for new column
    });
  };

  const getSortedStandings = (event: string) => {
    const standings = Object.entries(standingsData[event] || {});
    if (standings.length === 0) return [];

    return standings.sort(([, a], [, b]) => {
      if (a[sortConfig.sortKey] < b[sortConfig.sortKey]) {
        return sortConfig.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.sortKey] > b[sortConfig.sortKey]) {
        return sortConfig.sortOrder === 'asc' ? 1 : -1;
      }
      // Secondary sort by points if not sorting by points
      if (sortConfig.sortKey !== 'points') {
        if (b.points !== a.points) return b.points - a.points;
      }
      // Tertiary sort by wins
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl animate-fade-in">
       <div className="flex justify-between items-center mb-6 border-b-2 border-mak-gold pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-mak-gold">Papan Markah & Kedudukan</h2>
        </div>
      
      {schedule.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Tiada keputusan untuk dipaparkan.</p>
      ) : (
        <div className="space-y-16">
          {EVENTS.map(event => (
            <div key={event}>
              <h3 className="text-xl sm:text-2xl font-semibold text-mak-blue mb-6">{event}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Results Summary */}
                <div className="lg:col-span-3">
                  <h4 className="text-lg font-semibold text-mak-gold mb-4">Ringkasan Keputusan</h4>
                  <div className="overflow-x-auto rounded-lg shadow max-h-96">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700/50 sticky top-0">
                        <tr>
                          <th className="py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-300 sm:pl-6">Pusingan</th>
                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-300">Pasukan</th>
                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-300">Skor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50 bg-gray-800">
                        {schedule.flatMap((round, roundIndex) =>
                          round.map((match, matchIndex) => {
                            if (!match.team2) return null;
                            const matchId = `${event}-${roundIndex}-${match.team1}-vs-${match.team2}`;
                            const result = results[matchId];
                            if (!result || result.team1Score === null || result.team2Score === null) return null;
                            
                            const isTeam1Winner = result.team1Score > result.team2Score;
                            const isDraw = result.team1Score === result.team2Score;

                            return (
                              <tr key={matchId} className="hover:bg-gray-700/50">
                                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-gray-400 sm:pl-6">{roundIndex + 1}</td>
                                <td className="px-3 py-3 text-sm">
                                  <span className={isTeam1Winner ? 'font-bold text-white' : 'text-gray-300'}>{match.team1}</span>
                                  <span className="text-gray-500 mx-2">vs</span>
                                  <span className={!isTeam1Winner && !isDraw ? 'font-bold text-white' : 'text-gray-300'}>{match.team2}</span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-sm font-mono">
                                   <span className={isTeam1Winner ? 'font-bold text-mak-gold' : 'text-gray-400'}>{result.team1Score}</span>
                                   <span className="text-gray-500 mx-1">-</span>
                                   <span className={!isTeam1Winner && !isDraw ? 'font-bold text-mak-gold' : 'text-gray-400'}>{result.team2Score}</span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Standings */}
                <div className="lg:col-span-2">
                   <h4 className="text-lg font-semibold text-mak-gold mb-4">Carta Kedudukan</h4>
                   <div className="overflow-x-auto rounded-lg shadow">
                     <table className="min-w-full divide-y divide-gray-700">
                       <thead className="bg-gray-700/50">
                         <tr>
                           <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-300 sm:pl-6">Pasukan</th>
                            <SortableHeader label="Main" title="Perlawanan" sortKey="played" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                            <SortableHeader label="Menang" title="Menang" sortKey="wins" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                            <SortableHeader label="Kalah" title="Kalah" sortKey="losses" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                            <SortableHeader label="Mata" title="Mata" sortKey="points" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-700/50 bg-gray-800">
                         {getSortedStandings(event).map(([teamName, stats]) => (
                             <tr key={teamName}>
                               <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{teamName}</td>
                               <td className="whitespace-nowrap px-3 py-3 text-sm text-center text-gray-300">{stats.played}</td>
                               <td className="whitespace-nowrap px-3 py-3 text-sm text-center text-green-400">{stats.wins}</td>
                               <td className="whitespace-nowrap px-3 py-3 text-sm text-center text-red-400">{stats.losses}</td>
                               <td className="whitespace-nowrap px-3 py-3 text-sm text-center font-bold text-mak-gold">{stats.points}</td>
                             </tr>
                           ))}
                       </tbody>
                     </table>
                   </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsSummary;