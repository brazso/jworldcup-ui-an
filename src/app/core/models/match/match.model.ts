import { Round } from "src/app/core/models";

export interface Match {
    matctId?: number;
    goalExtraByTeam1?: number;
    goalExtraByTeam2?: number;
    goalNormalByTeam1?: number;
    goalNormalByTeam2?: number;
    goalPenaltyByTeam1?: number;
    goalPenaltyByTeam2?: number;
    matchN?: number;
    participantsRule?: string;
    startTime?: Date;
    round?: Round;
}
