import React from 'react';
import { Team, Player } from '../types';
import TeamCard from './TeamCard';

interface TeamListProps {
  teams: Team[];
  onUpdateRosterField: (teamId: number, playerIndex: number, field: keyof Player, value: string | boolean) => void;
  onUpdatePlayerAssignment: (teamId: number, event: string, playerNames: string[]) => void;
  onDeleteTeam: (teamId: number) => void;
  onUpdateTeamName: (teamId: number, newName: string) => void;
}

const TeamList: React.FC<TeamListProps> = ({ teams, onUpdateRosterField, onUpdatePlayerAssignment, onDeleteTeam, onUpdateTeamName }) => {
  if (teams.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-400">Tiada pasukan lagi.</h2>
        <p className="text-gray-500 mt-2">Gunakan borang di atas untuk menambah pasukan pertama.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {teams.map(team => (
        <TeamCard 
          key={team.id} 
          team={team} 
          onUpdateRosterField={onUpdateRosterField}
          onUpdatePlayerAssignment={onUpdatePlayerAssignment}
          onDeleteTeam={onDeleteTeam}
          onUpdateTeamName={onUpdateTeamName}
        />
      ))}
    </div>
  );
};

export default TeamList;
