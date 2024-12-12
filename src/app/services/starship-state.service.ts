import { Injectable, computed, signal } from '@angular/core';
import { StarshipState } from '../models/starship-state';
import { GameSessionService } from './game-session.service';
import { TravelService } from './travel.service';

@Injectable({
  providedIn: 'root',
})
export class StarshipStateService {
  private starshipState = signal<StarshipState>({
    currentLocation: { x: 100, y: 100 }, // Earth's coordinates
    isMoving: false,
    speed: 1,
  });

  private positionUpdateInterval: number | null = null;
  private timeUpdateInterval: number | null = null;
  private timeSignal = signal<number>(Date.now());

  constructor(
    private gameSessionService: GameSessionService,
    private travelService: TravelService
  ) {}

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
    // Get initial state from database
    const state = await this.gameSessionService
      .getStarshipState(gameSessionId)
      .toPromise();
    if (state) {
      this.starshipState.set({
        currentLocation: state.currentLocation || { x: 100, y: 100 },
        destinationLocation: state.destinationLocation,
        isMoving: state.isMoving || false,
        departureTime: state.departureTime,
        arrivalTime: state.arrivalTime,
        speed: state.speed || 1,
      });

      this.startPositionUpdates(gameSessionId);
    }
  }

  public async setDestination(
    gameSessionId: string,
    destination: { x: number; y: number }
  ): Promise<void> {
    const currentState = this.starshipState();
    const departureTime = Date.now();
    const travelTime = this.travelService.calculateTravelTime(
      currentState.currentLocation,
      destination,
      currentState.speed || 1
    );

    const newState: StarshipState = {
      ...currentState,
      destinationLocation: destination,
      isMoving: true,
      departureTime,
      arrivalTime: departureTime + travelTime * 1000, // Convert to milliseconds
      speed: currentState.speed || 1,
    };

    await this.gameSessionService.updateStarshipState(gameSessionId, newState);
    this.starshipState.set(newState);
  }
  public startPositionUpdates(gameSessionId: string): void {
    this.positionUpdateInterval = window.setInterval(async () => {
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
      const newState: StarshipState = {
        currentLocation: state.destinationLocation,
        isMoving: false,
        speed: state.speed,
      };

      await this.gameSessionService.updateStarshipState(
        gameSessionId,
        newState
      );
      this.starshipState.set(newState);
    }
  }

  async updateSpeed(gameSessionId: string, newSpeed: number): Promise<void> {
    const currentState = this.starshipState();
    const speed = Math.max(1, Math.min(9, newSpeed));

    if (
      currentState.isMoving &&
      currentState.destinationLocation &&
      currentState.departureTime
    ) {
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
      };

      await this.gameSessionService.updateStarshipState(
        gameSessionId,
        newState
      );
      this.starshipState.set(newState);
    } else {
      const newState = {
        currentLocation: currentState.currentLocation,
        isMoving: false,
        speed,
      };
      await this.gameSessionService.updateStarshipState(
        gameSessionId,
        newState
      );
      this.starshipState.set(newState);
    }
  }

  ngOnDestroy(): void {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }
}
