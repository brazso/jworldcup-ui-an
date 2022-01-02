import { Match, User } from "src/app/core/models";

export interface Bet {
    betId?: number;
    goalNormalByTeam1?: number;
    goalNormalByTeam2?: number;
    match?: Match;
    user?: User;
	score?: number;
}
