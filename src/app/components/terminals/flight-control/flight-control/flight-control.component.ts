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
      this.gameSessionService
        .getStarshipState(this.gameSessionId()!)
        .pipe(takeUntil(this.destroy$))
        .subscribe((state) => {
          this.starshipState.set(state);
        });
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected showMap(): void {
    this.isMapVisible = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when map is open
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
}
