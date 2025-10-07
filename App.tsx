import React, { useState, useEffect } from 'react';
import { Team, Results, Player } from './types';
import { EVENTS } from './constants';
import Header from './components/Header';
import AddTeamForm from './components/AddTeamForm';
import TeamList from './components/TeamList';
import TournamentSchedule from './components/TournamentSchedule';
import ResultsEntry from './components/ResultsEntry';
import ResultsSummary from './components/ResultsSummary';
import GroupResults from './components/GroupResults';
import GroupResultsEntry from './components/GroupResultsEntry';
import PasswordPrompt from './components/PasswordPrompt';
import LineupDisplay from './components/LineupDisplay';

export type View = 'setup' | 'schedule' | 'lineup' | 'resultsEntry' | 'groupResultsEntry' | 'resultsSummary' | 'groupResults';

// Helper function to validate and migrate data structure
const migrateAndValidateData = (data: any): { teams: Team[], results: Results } => {
  if (
    !data ||
    typeof data !== 'object' ||
    !Array.isArray(data.teams)
  ) {
    throw new Error("Format data tidak sah.");
  }

  const migratedTeams = data.teams.map((team: any): Team => {
    const validatedTeam: Partial<Team> = {
      id: team.id || Date.now(),
      name: team.name || 'Pasukan Tanpa Nama',
      players: team.players || {},
      roster: [],
    };

    let migratedRoster: Player[] = [];
    if (Array.isArray(team.roster)) {
      migratedRoster = team.roster.map((p: any): Player => {
        if (p && typeof p === 'object' && 'name' in p) {
          return { 
              name: p.name || '', 
              gender: p.gender || '',
              isManager: !!p.isManager,
              isCoach: !!p.isCoach
          };
        }
        if (typeof p === 'string') {
          return { name: p, gender: '', isManager: false, isCoach: false };
        }
        return { name: '', gender: '', isManager: false, isCoach: false };
      });
    }
    
    while (migratedRoster.length < 8) {
      migratedRoster.push({ name: '', gender: '', isManager: false, isCoach: false });
    }
    validatedTeam.roster = migratedRoster.slice(0, 8);
    
    EVENTS.forEach(event => {
      if (!validatedTeam.players![event]) {
        validatedTeam.players![event] = [];
      }
    });
    
    return validatedTeam as Team;
  });

  return {
    teams: migratedTeams,
    results: data.results || {}
  };
};

const App: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<Results>({});
  const [view, setView] = useState<View>('resultsSummary');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load data from local storage on initial render
  useEffect(() => {
    try {
      const savedDataString = localStorage.getItem('maksaPingPongData');
      if (savedDataString) {
        const savedData = JSON.parse(savedDataString);
        const { teams: loadedTeams, results: loadedResults } = migrateAndValidateData(savedData);
        setTeams(loadedTeams);
        setResults(loadedResults);
      }
    } catch (error) {
      console.error("Gagal memuatkan data dari storan tempatan:", error);
      localStorage.removeItem('maksaPingPongData'); // Clear corrupted data
    }
  }, []);

  const handleAddTeam = (teamName: string) => {
    if (teamName && !teams.find(t => t.name.toLowerCase() === teamName.toLowerCase())) {
      const newTeam: Team = {
        id: Date.now(),
        name: teamName,
        roster: Array.from({ length: 8 }, () => ({ name: '', gender: '', isManager: false, isCoach: false })),
        players: EVENTS.reduce((acc, event) => ({ ...acc, [event]: [] }), {}),
      };
      setTeams([...teams, newTeam]);
    }
  };

  const handleUpdateTeamName = (teamId: number, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
        alert("Nama pasukan tidak boleh kosong.");
        return;
    }
    if (teams.some(t => t.name.toLowerCase() === trimmedName.toLowerCase() && t.id !== teamId)) {
        alert("Nama pasukan ini sudah wujud.");
        return;
    }

    setTeams(teams.map(team => 
        team.id === teamId ? { ...team, name: trimmedName } : team
    ));
  };

  const handleUpdateRosterField = (teamId: number, playerIndex: number, field: keyof Player, value: string | boolean) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        const newRoster = [...team.roster];
        const updatedPlayer = { ...newRoster[playerIndex], [field]: value };
        newRoster[playerIndex] = updatedPlayer;
        return { ...team, roster: newRoster };
      }
      return team;
    }));
  };

  const handleUpdatePlayerAssignment = (teamId: number, event: string, playerNames: string[]) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, players: { ...team.players, [event]: playerNames } } 
        : team
    ));
  };

  const handleDeleteTeam = (teamId: number) => {
    setTeams(teams.filter(team => team.id !== teamId));
  };
  
  const handleUpdateResult = (matchId: string, team1Score: number | null, team2Score: number | null) => {
    setResults(prevResults => ({
      ...prevResults,
      [matchId]: { team1Score, team2Score }
    }));
  };

  const handleNavigate = (newView: View) => {
    if (['schedule', 'lineup', 'resultsEntry', 'groupResultsEntry'].includes(newView) && teams.length < 2) {
      alert("Sila tambah sekurang-kurangnya dua pasukan terlebih dahulu.");
      return;
    }
    setView(newView);
  }

  const handleSaveData = () => {
    try {
      const dataToSave = {
        teams,
        results,
      };
      localStorage.setItem('maksaPingPongData', JSON.stringify(dataToSave));
      alert("Data berjaya disimpan ke dalam sistem!");
    } catch (error) {
      console.error("Gagal menyimpan data ke storan tempatan:", error);
      alert("Gagal menyimpan data. Mungkin storan penuh.");
    }
  };

  const handleBackupData = () => {
    if (teams.length === 0) {
      alert("Tiada data untuk di-backup.");
      return;
    }
    const backupData = {
      teams,
      results,
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `maksa_pingpong_backup_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Gagal membaca fail.");
        
        const restoredData = JSON.parse(text);
        const { teams, results } = migrateAndValidateData(restoredData);

        setTeams(teams);
        setResults(results);
        alert("Data berjaya dikembalikan!");

      } catch (error: any) {
        console.error("Error restoring data:", error);
        alert(`Gagal mengembalikan data. Ralat: ${error.message}`);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const renderContent = () => {
    const isProtectedView = ['setup', 'resultsEntry', 'groupResultsEntry'].includes(view);
    
    if (isProtectedView && !isAuthenticated) {
        return <PasswordPrompt onAuthSuccess={() => setIsAuthenticated(true)} />;
    }

    switch (view) {
      case 'schedule':
        return <TournamentSchedule teams={teams} results={results} />;
      case 'lineup':
        return <LineupDisplay teams={teams} />;
      case 'resultsEntry':
        return <ResultsEntry teams={teams} results={results} onUpdateResult={handleUpdateResult} />;
      case 'groupResultsEntry':
        return <GroupResultsEntry teams={teams} results={results} onUpdateResult={handleUpdateResult} />;
      case 'resultsSummary':
        return <ResultsSummary teams={teams} results={results} />;
      case 'groupResults':
        return <GroupResults teams={teams} results={results} />;
      case 'setup':
      default:
        return (
          <div>
            <AddTeamForm onAddTeam={handleAddTeam} />
            <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-8 flex flex-col sm:flex-row items-center gap-4">
              <h3 className="text-lg font-semibold text-mak-gold whitespace-nowrap">Pengurusan Data</h3>
              <div className="flex-grow flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={handleSaveData}
                  className="w-full sm:w-auto flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M16 2H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm-1 12H5V4h10v10z"/><path d="M13 5H7v5h6V5zm-1 4H8V6h4v3z"/></svg>
                  Simpan Data
                </button>
                <button
                  onClick={handleBackupData}
                  className="w-full sm:w-auto flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  Backup Data
                </button>
                <label className="w-full sm:w-auto flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-300 cursor-pointer flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  Restore Data
                  <input type="file" accept=".json" className="hidden" onChange={handleRestoreData} />
                </label>
              </div>
            </div>
            <TeamList 
              teams={teams} 
              onUpdateRosterField={handleUpdateRosterField}
              onUpdatePlayerAssignment={handleUpdatePlayerAssignment}
              onDeleteTeam={handleDeleteTeam} 
              onUpdateTeamName={handleUpdateTeamName}
            />
            {teams.length > 1 && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => handleNavigate('schedule')}
                  className="bg-mak-gold hover:bg-yellow-400 text-mak-blue font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out"
                >
                  Jana Jadual & Carta
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header currentView={view} onNavigate={handleNavigate} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
