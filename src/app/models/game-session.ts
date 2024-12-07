import { MissionState } from './mission-models';

export interface GameSession {
  id?: string;
  playerIds: string[];
  entranceCode: string;
  createdAt: number;
  lastActive: number;
  missionId?: string;
  missionState?: MissionState;
}
