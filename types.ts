export interface Player {
  name: string;
  gender: 'Lelaki' | 'Wanita' | '';
  isManager: boolean;
  isCoach: boolean;
}

export interface PlayerAssignments {
  [event: string]: string[];
}

export interface Team {
  id: number;
  name: string;
  roster: Player[];
  players: PlayerAssignments;
}

export interface MatchResult {
  team1Score: number | null;
  team2Score: number | null;
}

export type Results = Record<string, MatchResult>;
