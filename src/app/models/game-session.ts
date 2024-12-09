import { MissionState } from './mission-models';
import { StarshipState } from './starship-state';

export interface GameSession {
  id?: string;
  playerIds: string[];
  entranceCode: string;
  createdAt: number;
  lastActive: number;
  missionId?: string;
  missionState?: MissionState;
  starshipState?: StarshipState;
}
