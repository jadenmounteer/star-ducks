import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SpaceObject } from '../../../../models/space-object';
import { CoursePlotterMapComponent } from '../course-plotter-map/course-plotter-map.component';
import { ActivatedRoute } from '@angular/router';
import { GameSessionService } from '../../../../services/game-session.service';
import { Subject, takeUntil } from 'rxjs';
import { StarshipState } from '../../../../models/starship-state';

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
  private destroy$ = new Subject<void>();
  protected gameSessionId = signal<string | null>(null);
  protected starshipState = signal<StarshipState>({
    currentLocation: { x: 100, y: 100 }, // Earth's coordinates
    isMoving: false,
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

    await this.gameSessionService.updateStarshipState(this.gameSessionId()!, {
      ...this.starshipState(),
      destinationLocation: destination.coordinates,
      isMoving: true,
    });
  }

  protected hideMap(): void {
    this.isMapVisible = false;
    document.body.style.overflow = ''; // Restore scrolling
  }
}
