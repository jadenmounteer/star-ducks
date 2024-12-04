import { MissionDifficulty } from '../../models/mission-models';
import { Role } from '../../models/role';
import { Mission } from '../mission';

export class TerroristsOnEarthMoonColonyMission extends Mission {
  id = 'terrorists-on-earth-moon-colony';
  name = 'Terrorists on Earth Moon Colony';
  description =
    'Negotiate with terrorists on Earth Moon Colony while avoiding detection';
  briefing =
    "A group of colonists have taken control of a mining facility on Earth's Moon. Your mission is to negotiate with them and resolve the situation peacefully.";
  difficulty: MissionDifficulty = 'Easy';
  availableRoles = [
    Role.CAPTAIN,
    Role.FLIGHT_CONTROL_OFFICER,
    Role.OPERATIONS_OFFICER,
  ];
  minimumPlayers = 1;
  maximumPlayers = this.availableRoles.length + 1;

  private klingonPatrolTimer?: any;
  private negotiationTimer?: any;

  initializeMission(): void {
    this.startMission();
    this.missionState.objectives = {
      establishContact: false,
      navigateKlingonSpace: false,
      completeNegotiation: false,
    };
    this.missionState.failureConditions = {
      klingonDetection: 0,
      negotiationTimeout: 1800, // 30 minutes in seconds
    };

    this.startKlingonPatrol();
    this.startNegotiationTimer();
  }

  checkObjectiveCompletion(objectiveId: string): boolean {
    switch (objectiveId) {
      case 'navigateKlingonSpace':
        return this.missionState.failureConditions['klingonDetection'] < 0.8;
      // Add other objective checks
      default:
        return false;
    }
  }

  checkFailureConditions(): boolean {
    return (
      this.missionState.failureConditions['klingonDetection'] >= 1 ||
      this.missionState.failureConditions['negotiationTimeout'] <= 0
    );
  }

  private startKlingonPatrol() {
    // Simulate Klingon patrol movements
    this.klingonPatrolTimer = setInterval(() => {
      // Update klingonDetection based on ship position and actions
    }, 5000);
  }

  private startNegotiationTimer() {
    this.negotiationTimer = setInterval(() => {
      this.missionState.failureConditions['negotiationTimeout']--;
    }, 1000);
  }

  // Clean up when mission ends
  public cleanup() {
    if (this.klingonPatrolTimer) clearInterval(this.klingonPatrolTimer);
    if (this.negotiationTimer) clearInterval(this.negotiationTimer);
  }
}
