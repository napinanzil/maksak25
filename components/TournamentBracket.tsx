import React, { useMemo } from 'react';
import { Team } from '../types';

interface TournamentBracketProps {
  teams: Team[];
  event: string;
}

interface Participant {
  name: string;
  players?: string;
}

type Match = [Participant, Participant];
type Round = Match[];

const TournamentBracket: React.FC<TournamentBracketProps> = ({ teams, event }) => {
  const rounds = useMemo(() => {
    const participants: Participant[] = teams
      .map(team => ({
        name: team.name,
        players: (team.players[event] || []).filter(p => p).join(' & '),
      }))
      .filter(p => p.players);

    // Shuffle for random matchups
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }

    if (participants.length < 2) return [];

    const numParticipants = participants.length;
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
    const allRounds: Round[] = [];

    const TBD_PARTICIPANT: Participant = { name: 'TBD', players: '' };
    const BYE_PARTICIPANT: Participant = { name: 'BYE', players: '' };

    let roundPlayers: Participant[] = [...participants];
    while(roundPlayers.length < bracketSize) {
      roundPlayers.push(BYE_PARTICIPANT);
    }

    const numRounds = Math.log2(bracketSize);
    for (let r = 0; r < numRounds; r++) {
      const round: Round = [];
      const nextRoundPlayers: Participant[] = [];

      for (let i = 0; i < roundPlayers.length; i += 2) {
        const p1 = roundPlayers[i];
        const p2 = roundPlayers[i+1];
        round.push([p1, p2]);

        if (p1.name === 'BYE' && p2.name === 'BYE') {
            nextRoundPlayers.push(BYE_PARTICIPANT);
        } else if (p1.name === 'BYE') {
            nextRoundPlayers.push(p2);
        } else if (p2.name === 'BYE') {
            nextRoundPlayers.push(p1);
        } else {
            nextRoundPlayers.push(TBD_PARTICIPANT);
        }
      }
      allRounds.push(round);
      roundPlayers = nextRoundPlayers;
      if (roundPlayers.length < 2) break;
    }

    return allRounds;

  }, [teams, event]);

  if (!rounds || rounds.length === 0) {
    return <div className="text-center text-gray-400 py-10">Tiada pasukan yang mencukupi atau tiada pemain ditetapkan untuk acara ini untuk menjana carta aliran.</div>;
  }

  return (
    <>
    <style>{`
      .bracket-container {
        display: flex;
        flex-direction: row;
        overflow-x: auto;
        padding: 20px;
        min-width: min-content;
      }
      .round {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        flex-grow: 1;
        min-width: 200px;
      }
      .match {
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        margin: 20px 0;
        padding: 10px 0;
      }
      .match-connector {
        display: flex;
        align-items: center;
        flex-grow: 1;
        min-width: 40px;
      }
      .connector-line {
        width: 100%;
        height: 2px;
        background-color: #4A5568;
      }
      .team {
        padding: 8px 12px;
        background-color: #2D3748;
        border: 1px solid #4A5568;
        border-radius: 4px;
        color: #E2E8F0;
        width: 100%;
      }
       .team-bye {
        font-style: italic;
        color: #A0AEC0;
      }
      .team-players {
        font-size: 0.75rem;
        color: #A0AEC0;
        margin-top: 2px;
      }
      .team + .team {
        margin-top: 10px;
      }
      .match::after {
        content: '';
        position: absolute;
        right: -20px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 2px;
        background-color: #4A5568;
      }
      .round:last-child .match::after {
        display: none;
      }
      .match-lines {
        position: absolute;
        right: -20px;
        top: 25%;
        height: 50%;
        width: 2px;
        background-color: #4A5568;
      }
    `}</style>
    <div className="bracket-container">
      {rounds.map((round, roundIndex) => (
        <React.Fragment key={roundIndex}>
          <div className="round">
            {round.map((match, matchIndex) => {
                const isDoubleBye = match[0].name === 'BYE' && match[1].name === 'BYE';
                const isCompetitiveMatch = match[0].name !== 'BYE' && match[1].name !== 'BYE';

                return (
                    <div className="match" key={matchIndex} style={{ visibility: isDoubleBye ? 'hidden' : 'visible' }}>
                        {isCompetitiveMatch && <div className="match-lines"></div>}
                        <div className={`team ${match[0].name === 'BYE' ? 'team-bye' : ''}`}>
                            {match[0].name}
                            {match[0].players && <div className="team-players">{match[0].players}</div>}
                        </div>
                        <div className={`team ${match[1].name === 'BYE' ? 'team-bye' : ''}`}>
                            {match[1].name}
                            {match[1].players && <div className="team-players">{match[1].players}</div>}
                        </div>
                    </div>
                );
            })}
          </div>
          {roundIndex < rounds.length - 1 && (
            <div className="match-connector">
              <div className="connector-line"></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
    </>
  );
};

export default TournamentBracket;