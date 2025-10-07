import React, { useState } from 'react';
import { Team, Player } from '../types';
import { EVENTS } from '../constants';

interface TeamCardProps {
  team: Team;
  onUpdateRosterField: (teamId: number, playerIndex: number, field: keyof Player, value: string | boolean) => void;
  onUpdatePlayerAssignment: (teamId: number, event: string, playerNames: string[]) => void;
  onDeleteTeam: (teamId: number) => void;
  onUpdateTeamName: (teamId: number, newName: string) => void;
}

const DeleteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const CancelIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const TeamCard: React.FC<TeamCardProps> = ({ team, onUpdateRosterField, onUpdatePlayerAssignment, onDeleteTeam, onUpdateTeamName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(team.name);
  
  const handleDelete = () => {
    if (window.confirm(`Anda pasti mahu memadam pasukan "${team.name}"?`)) {
      onDeleteTeam(team.id);
    }
  };

  const handleSaveName = () => {
    onUpdateTeamName(team.id, editedName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(team.name);
    setIsEditing(false);
  };
  
  const handleAssignmentChange = (event: string, playerIndex: number, selectedPlayerName: string) => {
    // Construct the proposed new state for assignments
    const isDoubles = event.toLowerCase().includes('beregu');
    const currentAssignments = team.players[event] || [];
    let newAssignments: string[];

    if (isDoubles) {
      newAssignments = [...currentAssignments];
      if (newAssignments.length < 2) newAssignments = ['', ''];
      newAssignments[playerIndex] = selectedPlayerName;
    } else {
      newAssignments = [selectedPlayerName];
    }
    
    // Create a deep copy of the current player assignments and apply the change
    const proposedPlayerAssignments = JSON.parse(JSON.stringify(team.players));
    proposedPlayerAssignments[event] = newAssignments;
    
    // --- START NEW VALIDATION LOGIC ---

    // 1. Find player object from roster
    const selectedPlayer = team.roster.find(p => p.name === selectedPlayerName);
    
    if (selectedPlayerName && !selectedPlayer?.gender) {
        alert(`Sila tetapkan jantina untuk pemain "${selectedPlayerName}" dalam senarai roster terlebih dahulu.`);
        return;
    }

    // 2. Event category gender checks
    const isMaleEvent = event === 'Perseorangan Lelaki' || event === 'Beregu Lelaki';
    const isFemaleEvent = event === 'Perseorangan Wanita' || event === 'Beregu Wanita';

    if (selectedPlayer?.gender === 'Lelaki' && isFemaleEvent) {
        alert(`Pemain lelaki "${selectedPlayerName}" tidak boleh didaftarkan dalam acara wanita.`);
        return;
    }
    if (selectedPlayer?.gender === 'Wanita' && isMaleEvent) {
        alert(`Pemain wanita "${selectedPlayerName}" tidak boleh didaftarkan dalam acara lelaki.`);
        return;
    }

    // 3. Check event counts for all players based on proposed changes
    const playerEventMap: { [key: string]: string[] } = {};
    for (const evt in proposedPlayerAssignments) {
        for (const playerName of proposedPlayerAssignments[evt]) {
            if (playerName) {
                if (!playerEventMap[playerName]) playerEventMap[playerName] = [];
                playerEventMap[playerName].push(evt);
            }
        }
    }

    for (const playerName in playerEventMap) {
        const player = team.roster.find(p => p.name === playerName);
        if (!player) continue;

        const events = playerEventMap[playerName];
        
        if (player.gender === 'Lelaki' && events.length > 2) {
            alert(`Pemain lelaki "${playerName}" hanya boleh menyertai maksimum 2 acara.`);
            return;
        }

        if (player.gender === 'Wanita' && events.length > 3) {
            alert(`Pemain wanita "${playerName}" hanya boleh menyertai maksimum 3 acara.`);
            return;
        }
    }
    
    // --- END NEW VALIDATION LOGIC ---

    onUpdatePlayerAssignment(team.id, event, newAssignments);
  };
  
  const validRosterPlayers = team.roster.filter(p => p.name.trim() !== '' && p.gender !== '');

  const getFilteredPlayersForEvent = (event: string, playerIndex: number = 0, assignedPlayers: string[] = []): Player[] => {
    // 1. Determine the required gender for the slot
    let requiredGender: Player['gender'] | null = null;
    const isMixedEvent = event === 'Beregu Campuran';

    if (event.includes('Lelaki') || (isMixedEvent && playerIndex === 0)) {
        requiredGender = 'Lelaki';
    } else if (event.includes('Wanita') || (isMixedEvent && playerIndex === 1)) {
        requiredGender = 'Wanita';
    }

    if (!requiredGender) return [];

    // 2. Get all valid players of that gender
    let eligiblePlayers = validRosterPlayers.filter(p => p.gender === requiredGender);

    // 3. For same-gender doubles, exclude the other selected player
    const isSameGenderDoubles = event === 'Beregu Lelaki' || event === 'Beregu Wanita';
    if (isSameGenderDoubles) {
        const otherPlayerName = playerIndex === 0 ? assignedPlayers[1] : assignedPlayers[0];
        if (otherPlayerName) {
            eligiblePlayers = eligiblePlayers.filter(p => p.name !== otherPlayerName);
        }
    }

    return eligiblePlayers;
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl hover:shadow-mak-blue/20 flex flex-col">
      <div className="p-5 bg-gray-700/50 flex justify-between items-center border-b-2 border-mak-blue">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="flex-grow bg-gray-600 border border-gray-500 rounded-md py-1 px-2 text-xl font-bold text-white focus:ring-1 focus:ring-mak-gold focus:border-mak-gold"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button onClick={handleSaveName} className="p-2 text-green-400 hover:bg-gray-600 rounded-full" aria-label="Simpan nama pasukan">
              <SaveIcon />
            </button>
            <button onClick={handleCancelEdit} className="p-2 text-red-400 hover:bg-gray-600 rounded-full" aria-label="Batal edit">
              <CancelIcon />
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white">{team.name}</h3>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-mak-gold transition-colors duration-300 p-2 rounded-full hover:bg-gray-600"
                aria-label={`Edit nama pasukan ${team.name}`}
              >
                <EditIcon />
              </button>
              <button 
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors duration-300 p-2 rounded-full hover:bg-gray-600"
                aria-label={`Padam pasukan ${team.name}`}
              >
                <DeleteIcon />
              </button>
            </div>
          </>
        )}
      </div>
      <div className="p-5 space-y-4 flex-grow">
        <div>
            <h4 className="text-md font-semibold text-mak-gold mb-2">Roster Pemain (8 orang)</h4>
            <div className="space-y-2">
                {team.roster.map((player, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={player.name}
                            onChange={(e) => onUpdateRosterField(team.id, index, 'name', e.target.value)}
                            placeholder={`Pemain ${index + 1}`}
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-mak-gold focus:border-mak-gold transition duration-200"
                        />
                        <select
                           value={player.gender}
                           onChange={(e) => onUpdateRosterField(team.id, index, 'gender', e.target.value)}
                           className="w-24 bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-mak-gold focus:border-mak-gold transition duration-200"
                        >
                            <option value="">Jantina</option>
                            <option value="Lelaki">Lelaki</option>
                            <option value="Wanita">Wanita</option>
                        </select>
                        <div className="flex items-center space-x-1" title="Manager">
                            <input 
                                type="checkbox" 
                                id={`manager-${team.id}-${index}`}
                                checked={player.isManager}
                                onChange={(e) => onUpdateRosterField(team.id, index, 'isManager', e.target.checked)}
                                className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-mak-blue focus:ring-mak-blue cursor-pointer"
                            />
                            <label htmlFor={`manager-${team.id}-${index}`} className="text-xs text-gray-400 cursor-pointer">M</label>
                        </div>
                        <div className="flex items-center space-x-1" title="Jurulatih">
                            <input 
                                type="checkbox" 
                                id={`coach-${team.id}-${index}`}
                                checked={player.isCoach}
                                onChange={(e) => onUpdateRosterField(team.id, index, 'isCoach', e.target.checked)}
                                className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-mak-blue focus:ring-mak-blue cursor-pointer"
                            />
                            <label htmlFor={`coach-${team.id}-${index}`} className="text-xs text-gray-400 cursor-pointer">J</label>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <hr className="border-gray-600" />

        <div>
            <h4 className="text-md font-semibold text-mak-gold mb-2">Penetapan Acara</h4>
            <div className="space-y-3">
            {EVENTS.map(event => {
              const isDoubles = event.toLowerCase().includes('beregu');
              const assignedPlayers = team.players[event] || [];
              return (
                <div key={event}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{event}</label>
                  {isDoubles ? (
                    <div className="flex gap-2">
                      {[0, 1].map(i => {
                        const filteredPlayers = getFilteredPlayersForEvent(event, i, assignedPlayers);
                        const label = event === 'Beregu Campuran' ? (i === 0 ? 'Lelaki' : 'Wanita') : `Pemain ${i+1}`;
                        return (
                          <select
                            key={i}
                            value={assignedPlayers[i] || ''}
                            onChange={(e) => handleAssignmentChange(event, i, e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-1 focus:ring-mak-gold focus:border-mak-gold transition duration-200"
                          >
                            <option value="">Pilih {label}</option>
                            {filteredPlayers.map(p => (
                              <option key={p.name} value={p.name}>{p.name} ({p.gender})</option>
                            ))}
                          </select>
                        )
                      })}
                    </div>
                  ) : (
                    <select
                      value={assignedPlayers[0] || ''}
                      onChange={(e) => handleAssignmentChange(event, 0, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-1 focus:ring-mak-gold focus:border-mak-gold transition duration-200"
                    >
                      <option value="">Pilih Pemain</option>
                      {getFilteredPlayersForEvent(event, 0, assignedPlayers).map(p => (
                        <option key={p.name} value={p.name}>{p.name} ({p.gender})</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
