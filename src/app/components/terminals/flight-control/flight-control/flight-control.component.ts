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
import { Subject } from 'rxjs';
import { TravelService } from '../../../../services/travel.service';
import { TimeFormatService } from '../../../../services/time-format.service';
import { StarshipStateService } from '../../../../services/starship-state.service';
import { spaceObjects } from '../../../../models/space-objects';
import { TerritoryService } from '../../../../services/territory/territory.service';
import { Territory } from '../../../../models/territory';

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
  private timeFormatService = inject(TimeFormatService);
  protected starshipStateService = inject(StarshipStateService);
  private territoryService = inject(TerritoryService);

  private positionUpdateInterval: number | null = null;
  private timeUpdateInterval: number | null = null;
  private timeSignal = signal<number>(Date.now());

  protected remainingTime = this.starshipStateService.remainingTime;

  protected currentPosition = computed(() => {
    const state = this.starshipStateService.getStarshipState();
    if (
      !state().isMoving ||
      !state().departureTime ||
      !state().destinationLocation
    ) {
      return state().currentLocation;
    }

    return this.travelService.calculateCurrentPosition(
      state().currentLocation ?? { x: 100, y: 100 }, // Add null coalescing operator
      state().destinationLocation ?? { x: 100, y: 100 }, // Add null coalescing operator
      state().departureTime ?? 0,
      state().speed ?? 1
    );
  });

  protected currentSpeed = computed(
    () => this.starshipStateService.getStarshipState()().speed ?? 1
  );

  protected destinationLocation = computed(
    () => this.starshipStateService.getStarshipState()().destinationLocation
  );

  protected isMoving = computed(
    () => this.starshipStateService.getStarshipState()().isMoving
  );

  private secondsToDestination = computed(() => {
    // Force recomputation by reading the timeSignal
    this.timeSignal();

    const state = this.starshipStateService.getStarshipState();
    if (
      !state().isMoving ||
      !state().departureTime ||
      !state().destinationLocation
    ) {
      return 0;
    }

    // Calculate remaining distance
    const currentPos = this.travelService.calculateCurrentPosition(
      state().currentLocation ?? { x: 100, y: 100 }, // Add null coalescing operator
      state().destinationLocation ?? { x: 100, y: 100 }, // Add null coalescing operator
      state().departureTime ?? 0,
      state().speed ?? 1
    );

    // Calculate time for remaining distance
    return this.travelService.calculateTravelTime(
      currentPos,
      state().destinationLocation ?? { x: 100, y: 100 }, // Add null coalescing operator
      state().speed ?? 1
    );
  });

  protected formattedTimeToDestination = computed(() => {
    const seconds = this.secondsToDestination();
    return this.timeFormatService.formatTime(seconds);
  });

  private destroy$ = new Subject<void>();
  protected gameSessionId = signal<string | null>(null);

  protected isMapVisible = false;

  protected destinationName = computed(() => {
    const state = this.starshipStateService.getStarshipState()();
    if (!state.destinationLocation) return '';

    // Find the space object that matches these coordinates
    const destination = spaceObjects.find(
      (obj) =>
        obj.coordinates.x === state.destinationLocation?.x &&
        obj.coordinates.y === state.destinationLocation?.y
    );

    return destination?.name || 'Unknown Location';
  });

  protected getCurrentTerritory(): Territory {
    const position = this.currentPosition();
    const territory = this.territoryService.getTerritoryAtLocation(
      position.x,
      position.y
    );

    if (!territory) {
      return {
        id: 'neutral',
        name: 'Neutral Zone',
        color: 'rgba(128, 128, 128, 0.1)',
        borderColor: 'rgba(128, 128, 128, 0.5)',
        bounds: {
          minX: 0,
          maxX: 0,
          minY: 0,
          maxY: 0,
        },
      };
    }

    return territory;
  }

  public ngOnInit(): void {
    const gameSessionId = this.route.snapshot.paramMap.get('gameSessionId');
    if (gameSessionId) {
      this.gameSessionId.set(gameSessionId);
      this.starshipStateService.initializeState(gameSessionId);
    }
  }

  protected showMap(): void {
    this.isMapVisible = true;
    document.body.style.overflow = 'hidden';

    // Clear existing interval before map opens
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }
    this.starshipStateService.startPositionUpdates(this.gameSessionId()!);
  }

  protected async onDestinationSelected(
    destination: SpaceObject
  ): Promise<void> {
    if (!this.gameSessionId()) {
      console.error('Game session ID is not set');
      return;
    }
    await this.starshipStateService.setDestination(
      this.gameSessionId()!,
      destination.coordinates
    );
  }

  protected hideMap(): void {
    this.isMapVisible = false;
    document.body.style.overflow = ''; // Restore scrolling
    this.starshipStateService.startPositionUpdates(this.gameSessionId()!);
  }

  protected getLocationName(coordinates: { x: number; y: number }): string {
    // Find the closest space object to these coordinates
    const closestObject = spaceObjects.find(
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
    await this.starshipStateService.updateSpeed(
      this.gameSessionId()!,
      newSpeed
    );
  }

  public ngOnDestroy(): void {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
