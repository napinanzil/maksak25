export interface Match {
  team1: string;
  team2: string | null; // null for a bye
}

export type Round = Match[];
export type Schedule = Round[];

export const generateSchedule = (teamNames: string[]): Schedule => {
  const teams = [...teamNames];
  if (teams.length < 2) return [];

  if (teams.length % 2 !== 0) {
    teams.push('BYE');
  }

  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const half = numTeams / 2;
  const schedule: Schedule = [];

  for (let round = 0; round < numRounds; round++) {
    const currentRound: Round = [];
    for (let i = 0; i < half; i++) {
      const team1 = teams[i];
      const team2 = teams[numTeams - 1 - i];
      
      if (team1 === 'BYE') {
        currentRound.push({ team1: team2, team2: null });
      } else if (team2 === 'BYE') {
        currentRound.push({ team1: team1, team2: null });
      } else {
         if (round % 2 === 1 && i === 0) {
             currentRound.push({ team1: team2, team2: team1 });
        } else {
             currentRound.push({ team1, team2 });
        }
      }
    }
    schedule.push(currentRound);
    
    const lastTeam = teams.pop();
    if (lastTeam) {
        teams.splice(1, 0, lastTeam);
    }
  }

  return schedule;
};
