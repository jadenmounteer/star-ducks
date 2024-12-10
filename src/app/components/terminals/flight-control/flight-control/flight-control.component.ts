import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { SpaceObject } from '../../../../models/space-object';
import { CoursePlotterMapComponent } from '../course-plotter-map/course-plotter-map.component';
import { ActivatedRoute } from '@angular/router';
import { GameSessionService } from '../../../../services/game-session.service';
import { Subject, takeUntil } from 'rxjs';
import { StarshipState } from '../../../../models/starship-state';
import { TravelService } from '../../../../services/travel.service';

@Component({
  selector: 'app-flight-control',
  standalone: true,
  imports: [CoursePlotterMapComponent],
  templateUrl: './flight-control.component.html',
  styleUrl: './flight-control.component.scss',
})
export class FlightControlComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private gameSessionService = inject(GameSessionService);
  private travelService = inject(TravelService);

  private positionUpdateInterval: number | null = null;

  protected currentPosition = computed(() => {
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

  protected timeToDestination = computed(() => {
    const state = this.starshipState();
    if (!state.isMoving || !state.departureTime || !state.arrivalTime) {
      return 0;
    }

    const remainingTime = state.arrivalTime - Date.now();
    return Math.max(0, Math.ceil(remainingTime / 1000)); // in seconds
  });

  private destroy$ = new Subject<void>();
  protected gameSessionId = signal<string | null>(null);
  protected starshipState = signal<StarshipState>({
    currentLocation: { x: 100, y: 100 }, // Earth's coordinates
    isMoving: false,
    speed: 1,
  });

  protected isMapVisible = false;
  protected spaceObjects: SpaceObject[] = [
    {
      id: '1',
      name: 'Earth',
      type: 'planet',
      coordinates: { x: 100, y: 100 },
      sprite: 'assets/sprites/space-objects/earth.png',
      animationFrames: 2,
      size: 48,
      description: 'Home planet of Earth ducks.',
      territory: 'federation',
    },
    {
      id: '2',
      name: 'Dulcan',
      type: 'planet',
      coordinates: { x: 200, y: 300 },
      sprite: 'assets/sprites/space-objects/dulcan.png',
      animationFrames: 2,
      size: 96,
      description:
        'Home planet of the Dulcans. A peaceful species with no comprehension of what a dad joke is.',
      territory: 'federation',
    },
    {
      id: '2',
      name: 'Helios',
      type: 'star',
      coordinates: { x: 400, y: 300 },
      sprite: 'assets/sprites/space-objects/helios.png',
      animationFrames: 2,
      size: 192, // Bigger size for the star
      description: "Earth's star.",
      territory: 'federation',
    },
    // Add more space objects...
  ];

  public ngOnInit(): void {
    this.gameSessionId.set(this.route.snapshot.paramMap.get('gameSessionId'));

    if (this.gameSessionId()) {
      // Get initial state from database
      this.gameSessionService
        .getStarshipState(this.gameSessionId()!)
        .pipe(takeUntil(this.destroy$))
        .subscribe((state) => {
          if (state) {
            // Ensure we have all required properties
            this.starshipState.set({
              currentLocation: state.currentLocation || { x: 100, y: 100 },
              destinationLocation: state.destinationLocation,
              isMoving: state.isMoving || false,
              departureTime: state.departureTime,
              arrivalTime: state.arrivalTime,
              speed: state.speed || 1,
            });

            // Start position updates after we have initial state
            this.startPositionUpdates();
          }
        });
    }
  }

  private startPositionUpdates(): void {
    this.positionUpdateInterval = window.setInterval(async () => {
      const state = this.starshipState();
      if (state.isMoving && state.destinationLocation && state.departureTime) {
        // Check if we've arrived first
        if (state.arrivalTime && Date.now() >= state.arrivalTime) {
          await this.handleArrival();
          return; // Exit early after handling arrival
        }

        // Update current position if we haven't arrived yet
        const newPosition = this.travelService.calculateCurrentPosition(
          state.currentLocation,
          state.destinationLocation,
          state.departureTime,
          state.speed
        );

        // Update state with new position
        this.starshipState.set({
          ...state,
          currentLocation: newPosition,
        });
      }
    }, 1000); // Update every second
  }

  private async handleArrival(): Promise<void> {
    const state = this.starshipState();
    if (state.destinationLocation) {
      const newState: StarshipState = {
        currentLocation: state.destinationLocation,
        isMoving: false,
        speed: state.speed,
      };

      await this.gameSessionService.updateStarshipState(
        this.gameSessionId()!,
        newState
      );
    }
  }

  public ngOnDestroy(): void {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected showMap(): void {
    this.isMapVisible = true;
    document.body.style.overflow = 'hidden';

    // Clear existing interval before map opens
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }
    this.startPositionUpdates();
  }

  protected async onDestinationSelected(
    destination: SpaceObject
  ): Promise<void> {
    if (!this.gameSessionId()) return;

    const currentState = this.starshipState();
    const departureTime = Date.now();
    const travelTime = this.travelService.calculateTravelTime(
      currentState.currentLocation,
      destination.coordinates,
      currentState.speed || 1
    );

    await this.gameSessionService.updateStarshipState(this.gameSessionId()!, {
      ...currentState,
      destinationLocation: destination.coordinates,
      isMoving: true,
      departureTime,
      arrivalTime: departureTime + travelTime * 1000, // Convert to milliseconds
      speed: currentState.speed || 1,
    });
  }

  protected hideMap(): void {
    this.isMapVisible = false;
    document.body.style.overflow = ''; // Restore scrolling
    this.startPositionUpdates();
  }

  protected getLocationName(coordinates: { x: number; y: number }): string {
    // If we're moving between locations, show "In Transit"
    if (this.starshipState().isMoving) {
      return 'In Transit';
    }

    // Find the closest space object to these coordinates
    const closestObject = this.spaceObjects.find(
      (obj) =>
        Math.abs(obj.coordinates.x - coordinates.x) < 10 &&
        Math.abs(obj.coordinates.y - coordinates.y) < 10
    );

    if (closestObject) {
      return closestObject.name;
    }

    // If we're not near any known object
    return 'Deep Space';
  }

  protected async updateSpeed(newSpeed: number): Promise<void> {
    if (!this.gameSessionId()) return;

    const currentState = this.starshipState();

    // Ensure speed is within valid range (1-9)
    const speed = Math.max(1, Math.min(9, newSpeed));

    // If we're moving, recalculate arrival time based on new speed
    let updatedState: StarshipState = {
      ...currentState,
      speed,
    };

    if (
      currentState.isMoving &&
      currentState.destinationLocation &&
      currentState.departureTime
    ) {
      const newTravelTime = this.travelService.calculateTravelTime(
        currentState.currentLocation,
        currentState.destinationLocation,
        speed
      );

      updatedState = {
        ...updatedState,
        arrivalTime: currentState.departureTime + newTravelTime * 1000,
      };
    }

    await this.gameSessionService.updateStarshipState(
      this.gameSessionId()!,
      updatedState
    );
  }
}
