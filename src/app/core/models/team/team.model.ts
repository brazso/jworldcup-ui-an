import { Group } from "..";

export interface Team {
    teamId: number;
    fifaPoints?: number;
	flag?: string;
	name?: string;
	wsId?: number;
	group?: Group;
}