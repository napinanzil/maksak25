import React, { useMemo, useState } from 'react';
import { Team, Results } from '../types';
import { EVENTS } from '../constants';
import { generateSchedule } from '../utils/scheduleGenerator';
import MatchDetailsModal from './MatchDetailsModal';
import TeamMatchHistoryModal from './TeamMatchHistoryModal';

interface GroupResultsProps {
  teams: Team[];
  results: Results;
}

interface TeamStats {
  played: number;
  wins: number;
  losses: number;
  categoriesWon: number;
  categoriesLost: number;
  points: number;
}

type SortKey = keyof TeamStats | 'teamName';

const SortableHeader: React.FC<{
  label: string;
  title: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortOrder: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
  className?: string;
}> = ({ label, title, sortKey, currentSortKey, sortOrder, onSort, className = "px-3 py-3.5 text-center text-sm font-semibold text-gray-300" }) => {
  const isActive = sortKey === currentSortKey;
  return (
    <th 
      className={`${className} cursor-pointer hover:text-mak-gold transition-colors`}
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


const GroupResults: React.FC<GroupResultsProps> = ({ teams, results }) => {
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [selectedTeamForHistory, setSelectedTeamForHistory] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ sortKey: SortKey; sortOrder: 'asc' | 'desc' }>({ sortKey: 'points', sortOrder: 'desc' });
  const [selectedTeam1, setSelectedTeam1] = useState<string>('');
  const [selectedTeam2, setSelectedTeam2] = useState<string>('');

  const teamNames = teams.map(t => t.name);
  const schedule = generateSchedule(teamNames);

  const { standingsData, detailedMatches } = useMemo(() => {
    const teamStats: Record<string, TeamStats> = {};
    teamNames.forEach(name => {
      teamStats[name] = { played: 0, wins: 0, losses: 0, categoriesWon: 0, categoriesLost: 0, points: 0 };
    });

    const detailedMatches: any[] = [];

    schedule.forEach((round, roundIndex) => {
      round.forEach(match => {
        if (!match.team2) return; // Skip BYEs
        
        let team1CategoryWins = 0;
        let team2CategoryWins = 0;
        const eventWinners: { event: string, winner: string|null }[] = [];
        const { team1, team2 } = match;

        EVENTS.forEach(event => {
          const matchId = `${event}-${roundIndex}-${team1}-vs-${team2}`;
          const result = results[matchId];
          let winner = null;

          if (result && typeof result.team1Score === 'number' && typeof result.team2Score === 'number') {
            // Increment 'played' for each category with a result
            teamStats[team1].played++;
            teamStats[team2].played++;
            
            if (result.team1Score > result.team2Score) {
              team1CategoryWins++;
              winner = team1;
            } else if (result.team2Score > result.team1Score) {
              team2CategoryWins++;
              winner = team2;
            }
          }
           eventWinners.push({ event, winner });
        });

        // Update overall match-level stats if at least one category was played
        if (team1CategoryWins > 0 || team2CategoryWins > 0) {
            teamStats[team1].categoriesWon += team1CategoryWins;
            teamStats[team2].categoriesWon += team2CategoryWins;
            
            teamStats[team1].categoriesLost += team2CategoryWins;
            teamStats[team2].categoriesLost += team1CategoryWins;

            // Points are the number of categories won
            teamStats[team1].points += team1CategoryWins;
            teamStats[team2].points += team2CategoryWins;

            if (team1CategoryWins > team2CategoryWins) {
                teamStats[team1].wins++;
                teamStats[team2].losses++;
            } else if (team2CategoryWins > team1CategoryWins) {
                teamStats[team2].wins++;
                teamStats[team1].losses++;
            }
        }
        
        detailedMatches.push({
            ...match,
            round: roundIndex + 1,
            roundIndex: roundIndex,
            team1CategoryWins,
            team2CategoryWins,
            eventWinners,
        });

      });
    });

    const standingsData = Object.entries(teamStats);
    
    return { standingsData, detailedMatches };
  }, [teams, results, schedule]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prevConfig => {
      if (prevConfig.sortKey === key) {
        return { ...prevConfig, sortOrder: prevConfig.sortOrder === 'asc' ? 'desc' : 'asc' };
      }
      return { sortKey: key, sortOrder: 'desc' };
    });
  };

  const sortedStandings = useMemo(() => {
    return [...standingsData].sort(([teamNameA, a], [teamNameB, b]) => {
      const key = sortConfig.sortKey;

      let compareResult: number;

      if (key === 'teamName') {
        compareResult = teamNameA.localeCompare(teamNameB);
      } else {
        const statsA = a[key as keyof TeamStats];
        const statsB = b[key as keyof TeamStats];
        compareResult = statsB - statsA; // Default to descending for numeric stats
      }
      
      const orderMultiplier = sortConfig.sortOrder === 'asc' ? 1 : -1;
      
      // For numeric stats, we flip the multiplier for ascending order
      if (key !== 'teamName' && sortConfig.sortOrder === 'asc') {
        return -compareResult;
      }
      if (key === 'teamName') {
         return compareResult * orderMultiplier;
      }
      
      if (compareResult !== 0) return compareResult;

      // Secondary sort by points if not sorting by points
      if (key !== 'points' && b.points !== a.points) return b.points - a.points;

      // Tertiary sort by category difference
      const diffA = a.categoriesWon - a.categoriesLost;
      const diffB = b.categoriesWon - b.categoriesLost;
      if (diffB !== diffA) return diffB - diffA;

      return 0;
    });
  }, [standingsData, sortConfig]);

  const handleShowMatchDetailsFromDropdown = () => {
    if (!selectedTeam1 || !selectedTeam2) {
      alert("Sila pilih kedua-dua pasukan.");
      return;
    }
    if (selectedTeam1 === selectedTeam2) {
      alert("Sila pilih dua pasukan yang berbeza.");
      return;
    }

    const foundMatch = detailedMatches.find(match =>
      (match.team1 === selectedTeam1 && match.team2 === selectedTeam2) ||
      (match.team1 === selectedTeam2 && match.team2 === selectedTeam1)
    );

    if (foundMatch) {
      setSelectedMatch(foundMatch);
    } else {
      alert("Tiada perlawanan dijumpai antara pasukan yang dipilih.");
    }
  };

  return (
    <>
      <MatchDetailsModal 
        isOpen={!!selectedMatch} 
        onClose={() => setSelectedMatch(null)} 
        match={selectedMatch}
        results={results}
      />
      <TeamMatchHistoryModal
        isOpen={!!selectedTeamForHistory}
        onClose={() => setSelectedTeamForHistory(null)}
        teamName={selectedTeamForHistory}
        matches={detailedMatches}
        onSelectMatchDetails={(match) => setSelectedMatch(match)}
      />
      <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-8 border-b-2 border-mak-gold pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-mak-gold">Keputusan Format Kumpulan</h2>
        </div>

        {/* Standings Table */}
        <h3 className="text-xl sm:text-2xl font-semibold text-mak-blue mb-4">Carta Kedudukan Kumpulan</h3>
        <div className="overflow-x-auto rounded-lg shadow mb-12">
          <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                  <tr>
                      <SortableHeader label="Pasukan" title="Nama Pasukan" sortKey="teamName" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-300 sm:pl-6"/>
                      <SortableHeader label="Main" title="Jumlah Kategori Dimainkan" sortKey="played" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                      <SortableHeader label="Menang" title="Menang (Perlawanan)" sortKey="wins" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                      <SortableHeader label="Kalah" title="Kalah (Perlawanan)" sortKey="losses" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                      <SortableHeader label="Kategori Menang" title="Kategori Menang" sortKey="categoriesWon" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                      <SortableHeader label="Kategori Kalah" title="Kategori Kalah" sortKey="categoriesLost" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                      <SortableHeader label="Mata" title="Mata (Jumlah Kategori Menang)" sortKey="points" currentSortKey={sortConfig.sortKey} sortOrder={sortConfig.sortOrder} onSort={handleSort} />
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50 bg-gray-800">
                  {sortedStandings.map(([teamName, stats]) => (
                      <tr key={teamName}>
                        <td 
                          className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-white sm:pl-6 cursor-pointer hover:text-mak-gold transition-colors"
                          onClick={() => setSelectedTeamForHistory(teamName)}
                          title={`Lihat sejarah perlawanan untuk ${teamName}`}
                        >
                            {teamName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-center text-gray-300">{stats.played}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-center text-green-400">{stats.wins}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-center text-red-400">{stats.losses}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-center text-gray-300">{stats.categoriesWon}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-center text-gray-300">{stats.categoriesLost}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-center font-bold text-mak-gold">{stats.points}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>

        {/* Match Details Selector */}
        <div className="bg-gray-700/40 rounded-lg p-4 shadow mb-12">
            <h3 className="text-lg font-semibold text-mak-gold mb-4 text-center">Semak Butiran Perlawanan Pasukan</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <select
                    value={selectedTeam1}
                    onChange={(e) => setSelectedTeam1(e.target.value)}
                    className="w-full sm:w-auto flex-1 bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-mak-gold focus:border-mak-gold"
                >
                    <option value="">Pilih Pasukan A</option>
                    {teamNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                <span className="text-gray-400 font-bold">vs</span>
                <select
                    value={selectedTeam2}
                    onChange={(e) => setSelectedTeam2(e.target.value)}
                    className="w-full sm:w-auto flex-1 bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-mak-gold focus:border-mak-gold"
                >
                    <option value="">Pilih Pasukan B</option>
                    {teamNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                <button
                    onClick={handleShowMatchDetailsFromDropdown}
                    className="w-full sm:w-auto bg-mak-blue hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    Papar
                </button>
            </div>
        </div>


        {/* Detailed Match Results */}
        <h3 className="text-xl sm:text-2xl font-semibold text-mak-blue mb-4">Butiran Perlawanan</h3>
        <div className="space-y-6">
          {detailedMatches.map((match, index) => (
              <div key={index} className="bg-gray-700/40 rounded-lg p-4 shadow">
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                      <span className="text-sm text-gray-400">Pusingan {match.round}</span>
                      <div className="text-center flex-grow">
                          <span className={`text-lg font-bold ${match.team1CategoryWins > match.team2CategoryWins ? 'text-white' : 'text-gray-400'}`}>{match.team1}</span>
                          <span className="text-xl font-bold text-mak-gold mx-2">{match.team1CategoryWins} - {match.team2CategoryWins}</span>
                          <span className={`text-lg font-bold ${match.team2CategoryWins > match.team1CategoryWins ? 'text-white' : 'text-gray-400'}`}>{match.team2}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedMatch(match)}
                        className="bg-mak-blue/70 hover:bg-mak-blue text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors"
                      >
                        Papar Butiran
                      </button>
                  </div>
              </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default GroupResults;