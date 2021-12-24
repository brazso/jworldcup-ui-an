import { Match } from "src/app/core/models";

export interface Round {
    roundId?: number;
    isGroupmatch?: boolean;
    isOvertime?: boolean;
    name?: string;
    // matches?: Match[];
}
