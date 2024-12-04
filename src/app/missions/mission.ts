import { MissionDifficulty, MissionState } from '../models/mission-models';
import { Role } from '../models/role';

export abstract class Mission {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract briefing: string;
  abstract difficulty: MissionDifficulty;
  abstract availableRoles: Role[];
  abstract minimumPlayers: number;
  abstract maximumPlayers: number;

  // Mission state that will be stored in the database
  protected missionState: MissionState = {
    startedAt: 0,
    objectives: {},
    failureConditions: {},
  };

  // Abstract methods that missions must implement
  abstract initializeMission(): void;
  abstract checkObjectiveCompletion(objectiveId: string): boolean;
  abstract checkFailureConditions(): boolean;

  // Utility methods available to all missions
  protected startMission(): void {
    this.missionState.startedAt = Date.now();
  }

  public getMissionState() {
    return this.missionState;
  }

  public setMissionState(state: any) {
    this.missionState = state;
  }
}
