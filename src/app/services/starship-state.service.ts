import { Injectable, computed, signal } from '@angular/core';
import { StarshipState } from '../models/starship-state';
import { GameSessionService } from './game-session.service';
import { TravelService } from './travel.service';
import { ShipSystemsService } from './ship-systems/ship-systems.service';
import { PowerManagementService } from './power-management.service';
import { ShipSystemName } from '../models/ship-system';

@Injectable({
  providedIn: 'root',
})
export class StarshipStateService {
  private starshipState = signal<StarshipState>({
    currentLocation: { x: 100, y: 100 },
    isMoving: false,
    speed: 1,
    systems: this.shipSystemsService.initializeSystems(),
  });

  private timeUpdateInterval: number | null = null;
  private readonly TIME_UPDATE_INTERVAL = 1000; // Update every second

  private currentGameSessionId: string | null = null;

  // Add computed signal for remaining time
  readonly remainingTime = computed(() => {
    const state = this.starshipState();
    if (!state.isMoving || !state.arrivalTime) {
      return null;
    }
    const remaining = state.arrivalTime - Date.now();
    return remaining > 0 ? remaining : 0;
  });

  readonly formattedRemainingTime = computed(() => {
    const remaining = this.remainingTime();
    if (remaining === null) return null;

    // Convert milliseconds to minutes and seconds
    const totalSeconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Format with leading zeros if needed
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  });

  constructor(
    private gameSessionService: GameSessionService,
    private travelService: TravelService,
    private shipSystemsService: ShipSystemsService,
    private powerManagementService: PowerManagementService
  ) {
    // Start time updates when service is created
    this.startTimeUpdates();
  }

  private startTimeUpdates(): void {
    // Clear any existing interval
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }

    // Update time every second to trigger remainingTime recomputation
    this.timeUpdateInterval = window.setInterval(() => {
      const state = this.starshipState();
      if (
        state.isMoving &&
        state.arrivalTime &&
        Date.now() >= state.arrivalTime &&
        this.currentGameSessionId
      ) {
        this.handleArrival(this.currentGameSessionId);
      }
      // Force signal update to trigger recomputation
      this.starshipState.set({ ...state });
    }, this.TIME_UPDATE_INTERVAL);
  }

  ngOnDestroy(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  currentPosition = computed(() => {
    const state = this.starshipState();
    if (!state.isMoving || !state.departureTime || !state.destinationLocation) {
      return state.currentLocation;
    }

    return this.travelService.calculateCurrentPosition(
      state.currentLocation,
      state.destinationLocation,
      state.departureTime,
      state.speed
    );
  });

  getStarshipState() {
    return this.starshipState;
  }

  async initializeState(gameSessionId: string): Promise<void> {
    this.currentGameSessionId = gameSessionId;

    // Initialize systems first
    const initialSystems = this.shipSystemsService.initializeSystems();

    // Subscribe to real-time updates
    this.gameSessionService
      .getStarshipState(gameSessionId)
      .subscribe((state) => {
        if (state) {
          // Update ship systems if they exist in the state
          if (state.systems) {
            state.systems.forEach((system) => {
              this.shipSystemsService.updateSystem(system.name, system);
            });
          }

          this.starshipState.set({
            currentLocation: state.currentLocation || { x: 100, y: 100 },
            destinationLocation: state.destinationLocation,
            isMoving: state.isMoving || false,
            departureTime: state.departureTime,
            arrivalTime: state.arrivalTime,
            speed: state.speed || 1,
            systems: this.shipSystemsService.currentSystems, // Use the systems from the service
          });
        }
      });
  }

  public async setDestination(
    gameSessionId: string,
    destination: { x: number; y: number },
    requiredPower: number
  ): Promise<void> {
    const currentState = this.starshipState();

    this.powerManagementService.allocatePower(
      ShipSystemName.Engines,
      requiredPower
    );

    // Only proceed if we have enough power
    if (
      this.shipSystemsService.getSystemByName(ShipSystemName.Engines)
        ?.powerUsage === requiredPower
    ) {
      const departureTime = Date.now();
      const travelTime = this.travelService.calculateTravelTime(
        currentState.currentLocation,
        destination,
        currentState.speed
      );

      const newState: StarshipState = {
        ...currentState,
        destinationLocation: destination,
        isMoving: true,
        departureTime,
        arrivalTime: departureTime + travelTime * 1000,
        speed: currentState.speed,
        systems: this.shipSystemsService.currentSystems,
      };

      await this.gameSessionService.updateStarshipState(
        gameSessionId,
        newState
      );
      this.starshipState.set(newState);
    } else {
      console.error('Not enough power available for engines');
    }
  }
  public startPositionUpdates(gameSessionId: string): void {
    this.timeUpdateInterval = window.setInterval(async () => {
      const state = this.starshipState();
      if (state.isMoving && state.destinationLocation && state.departureTime) {
        if (state.arrivalTime && Date.now() >= state.arrivalTime) {
          await this.handleArrival(gameSessionId);
        }
      }
    }, 1000);
  }

  private async handleArrival(gameSessionId: string): Promise<void> {
    const state = this.starshipState();
    if (state.destinationLocation) {
      this.powerManagementService.allocatePower(ShipSystemName.Engines, 0);

      const newState: StarshipState = {
        currentLocation: state.destinationLocation,
        isMoving: false,
        speed: state.speed,
        systems: this.shipSystemsService.currentSystems,
      };

      await this.gameSessionService.updateStarshipState(
        gameSessionId,
        newState
      );
      this.starshipState.set(newState);
    }
  }

  async updateSpeed(
    gameSessionId: string,
    newSpeed: number,
    requiredPower: number
  ): Promise<void> {
    const currentState = this.starshipState();
    const speed = Math.max(1, Math.min(9, newSpeed));

    if (currentState.isMoving) {
      // Only adjust power if ship is already moving
      this.powerManagementService.allocatePower(
        ShipSystemName.Engines,
        requiredPower
      );

      // Only proceed with speed change if we have enough power
      if (
        this.shipSystemsService.getSystemByName(ShipSystemName.Engines)
          ?.powerUsage === requiredPower
      ) {
        if (currentState.destinationLocation && currentState.departureTime) {
          const currentPosition = this.travelService.calculateCurrentPosition(
            currentState.currentLocation,
            currentState.destinationLocation,
            currentState.departureTime,
            currentState.speed
          );

          const remainingTravelTime = this.travelService.calculateTravelTime(
            currentPosition,
            currentState.destinationLocation,
            speed
          );

          const newDepartureTime = Date.now();
          const newState = {
            currentLocation: currentPosition,
            destinationLocation: currentState.destinationLocation,
            isMoving: true,
            departureTime: newDepartureTime,
            arrivalTime: newDepartureTime + remainingTravelTime * 1000,
            speed,
            systems: this.shipSystemsService.currentSystems,
          };

          await this.gameSessionService.updateStarshipState(
            gameSessionId,
            newState as StarshipState
          );
          this.starshipState.set(newState);
        }
      } else {
        console.error('Not enough power available for requested speed');
        return;
      }
    } else {
      // If not moving, just update the speed without changing power
      const newState = {
        currentLocation: currentState.currentLocation,
        isMoving: false,
        speed,
        systems: this.shipSystemsService.currentSystems,
      };
      await this.gameSessionService.updateStarshipState(
        gameSessionId,
        newState as StarshipState
      );
      this.starshipState.set(newState);
    }
  }
}
