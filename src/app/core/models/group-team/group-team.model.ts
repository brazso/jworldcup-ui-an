import { Match, Team } from "..";

export interface groupTeam {
    team?: Team;
    playedMatches?: Match[];
    filterTeamIds?: number[];
    positionInGroup?: number;
    isTeamInGroupFinished?: boolean;
}