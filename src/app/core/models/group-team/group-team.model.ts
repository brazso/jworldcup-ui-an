import { Match, Team } from "..";

export interface GroupTeam {
    team?: Team;
    playedMatches?: Match[];
    filterTeamIds?: number[];
    positionInGroup?: number;
    isTeamInGroupFinished?: boolean;
    matchesPlayed?: number;
	won?: number;
	draw?: number;
	lost?: number;
	goalsFor?: number;
	goalsAgainst?: number;
	goalDifference?: number;
	points?: number;
}