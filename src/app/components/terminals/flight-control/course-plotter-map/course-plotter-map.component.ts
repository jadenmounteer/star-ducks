import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { SpaceObject } from '../../../../models/space-object';

import { SpaceObjectService } from '../../../../services/space-object.service';
import { CoursePlotterStarFieldService } from './stars/course-plotter-star-field.service';
import { CanvasService } from '../../../../services/animations/canvas.service';
import { TerritoryService } from '../../../../services/territory/territory.service';
import { StarshipIcon } from '../../../../models/starship-icon';
import { StarshipIconService } from '../../../../services/starship-icon/starship-icon.service';
import { StarshipState } from '../../../../models/starship-state';
import { TravelService } from '../../../../services/travel.service';
import { TimeFormatService } from '../../../../services/time-format.service';
import { DirectionalArrowService } from '../../../../services/directional-arrow/directional-arrow.service';

export const BOUNDS = {
  minX: -5000,
  maxX: 5000,
  minY: -5000,
  maxY: 5000,
};

@Component({
  standalone: true,
  selector: 'app-course-plotter-map',
  templateUrl: './course-plotter-map.component.html',
  styleUrls: ['./course-plotter-map.component.scss'],
})
export class CoursePlotterMapComponent implements AfterViewInit, OnDestroy {
  private territoryService = inject(TerritoryService);
  private starshipIconService = inject(StarshipIconService);
  private timeFormatService = inject(TimeFormatService);
  private travelService = inject(TravelService);
  private directionalArrowService = inject(DirectionalArrowService);

  protected currentState: StarshipState | null = null;

  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas') previewCanvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() spaceObjects: SpaceObject[] = [];
  @Input() set starshipState(state: StarshipState) {
    this.currentState = state;

    // Only set coordinates directly when not moving
    if (!state.isMoving) {
      this.starship.coordinates = state.currentLocation;
    }
  }

  @Input() gameSessionId!: string;

  @Output() destinationSelected = new EventEmitter<SpaceObject>();
  @Output() close = new EventEmitter<void>();

  private previewAnimationFrameId: number | null = null;
  private previewCtx!: CanvasRenderingContext2D;
  private ctx!: CanvasRenderingContext2D;
  public selectedObject: SpaceObject | null = null;
  private animationFrameId: number | null = null;
  private destroyFn: (() => void) | null = null;
  private hasDragged = false; // We don't want to open a modal if the user has dragged the map

  protected showTerritories = false;

  private starship: StarshipIcon = {
    coordinates: { x: 0, y: 0 },
    sprite: 'assets/sprites/star-ships/enterprise.png',
    animationFrames: 1,
    size: 32,
    speed: 1,
  };

  private viewport = { x: 0, y: 0 };

  protected isDragging = false;
  private lastMousePos = { x: 0, y: 0 };

  constructor(
    private coursePlotterStarFieldService: CoursePlotterStarFieldService,
    private canvasService: CanvasService,
    private spaceObjectService: SpaceObjectService
  ) {}

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.startAnimation();
    this.setupResizeObserver();
  }

  protected setDestinationCourse(): void {
    if (this.selectedObject) {
      this.destinationSelected.emit(this.selectedObject);
    }
  }
  // Add these methods to the component
  public startDrag(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    this.hasDragged = false;
    if (event instanceof MouseEvent) {
      this.lastMousePos = { x: event.clientX, y: event.clientY };
    } else {
      this.lastMousePos = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }
  }

  public endDrag(): void {
    this.isDragging = false;
  }

  protected toggleTerritories(): void {
    this.showTerritories = !this.showTerritories;
  }

  public handleDrag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;

    let currentPos;
    if (event instanceof MouseEvent) {
      currentPos = { x: event.clientX, y: event.clientY };
    } else {
      currentPos = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }

    const deltaX = currentPos.x - this.lastMousePos.x;
    const deltaY = currentPos.y - this.lastMousePos.y;

    // If the mouse has moved more than a few pixels, consider it a drag
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      this.hasDragged = true;
    }

    // Update viewport position with bounds checking
    this.viewport.x = Math.max(
      BOUNDS.minX,
      Math.min(BOUNDS.maxX, this.viewport.x - deltaX)
    );
    this.viewport.y = Math.max(
      BOUNDS.minY,
      Math.min(BOUNDS.maxY, this.viewport.y - deltaY)
    );

    this.lastMousePos = currentPos;
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();

    // Center viewport on current starship position
    if (this.currentState) {
      let currentPos;
      if (
        this.currentState.isMoving &&
        this.currentState.destinationLocation &&
        this.currentState.departureTime
      ) {
        currentPos = this.travelService.calculateCurrentPosition(
          this.currentState.currentLocation,
          this.currentState.destinationLocation,
          this.currentState.departureTime,
          this.currentState.speed
        );
      } else {
        currentPos = this.currentState.currentLocation;
      }

      this.viewport = {
        x: currentPos.x - canvas.width / 2,
        y: currentPos.y - canvas.height / 2,
      };
    }
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.coursePlotterStarFieldService.initStarField(
      canvas.width,
      canvas.height
    );
  }

  private startAnimation(): void {
    const animate = () => {
      const canvas = this.canvasRef.nativeElement;
      this.canvasService.clearCanvas(this.ctx, canvas.width, canvas.height);

      // Update starship position if moving
      if (
        this.currentState?.isMoving &&
        this.currentState.destinationLocation &&
        this.currentState.departureTime &&
        (!this.currentState.arrivalTime ||
          Date.now() < this.currentState.arrivalTime)
      ) {
        this.starship.coordinates = this.travelService.calculateCurrentPosition(
          this.currentState.currentLocation,
          this.currentState.destinationLocation,
          this.currentState.departureTime,
          this.currentState.speed
        );
      }

      if (this.showTerritories) {
        this.territoryService.drawTerritories(
          this.ctx,
          this.viewport.x,
          this.viewport.y,
          canvas.width,
          canvas.height
        );
      }

      // Draw course line if destination exists in state
      if (this.currentState?.destinationLocation) {
        const destinationObject = this.spaceObjects.find(
          (obj) =>
            obj.coordinates.x === this.currentState?.destinationLocation?.x &&
            obj.coordinates.y === this.currentState?.destinationLocation?.y
        );

        if (destinationObject) {
          this.starshipIconService.drawCourseLine(
            this.ctx,
            this.starship,
            destinationObject,
            this.viewport.x,
            this.viewport.y
          );
        }
      }

      this.coursePlotterStarFieldService.drawStarField(
        this.ctx,
        canvas.width,
        canvas.height,
        this.viewport.x,
        this.viewport.y
      );

      this.canvasService.drawGrid(
        this.ctx,
        canvas.width,
        canvas.height,
        this.viewport.x,
        this.viewport.y
      );

      this.spaceObjects.forEach((object) => {
        const adjustedObject = {
          ...object,
          coordinates: {
            x: object.coordinates.x - this.viewport.x,
            y: object.coordinates.y - this.viewport.y,
          },
        };
        this.spaceObjectService.drawSpaceObject(this.ctx, adjustedObject);
      });

      // Draw course line and starship
      const destinationObject = this.currentState?.destinationLocation
        ? this.spaceObjects.find(
            (obj) =>
              obj.coordinates.x === this.currentState?.destinationLocation?.x &&
              obj.coordinates.y === this.currentState?.destinationLocation?.y
          )
        : undefined;

      if (destinationObject) {
        this.starshipIconService.drawCourseLine(
          this.ctx,
          this.starship,
          destinationObject,
          this.viewport.x,
          this.viewport.y
        );
      }

      // Draw starship at calculated position
      this.starshipIconService.drawStarship(
        this.ctx,
        this.starship,
        this.viewport.x,
        this.viewport.y,
        destinationObject
      );

      // After drawing everything else, draw the directional arrow
      this.directionalArrowService.drawDirectionalArrow(
        this.ctx,
        canvas.width,
        canvas.height,
        this.starship.coordinates,
        this.viewport,
        '#dddddd',
        this.starship.size,
        true
      );

      // If there's a destination, draw an arrow to it too
      if (destinationObject) {
        this.directionalArrowService.drawDirectionalArrow(
          this.ctx,
          canvas.width,
          canvas.height,
          destinationObject.coordinates,
          this.viewport,
          '#ff0000',
          destinationObject.size
        );
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private setupResizeObserver(): void {
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });

    resizeObserver.observe(window.document.body);
    this.destroyFn = () => resizeObserver.disconnect();
  }
  public async handleClick(event: MouseEvent): Promise<void> {
    if (this.hasDragged) {
      // Reset the flag and ignore the click if we dragged
      this.hasDragged = false;
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left + this.viewport.x;
    const y = event.clientY - rect.top + this.viewport.y;

    const clickedObject = this.spaceObjects.find((object) =>
      this.spaceObjectService.isPointInObject(x, y, object)
    );

    if (clickedObject) {
      this.selectedObject = clickedObject;
      setTimeout(() => this.initializePreviewCanvas(), 0);
    }
  }

  private initializePreviewCanvas(): void {
    if (!this.selectedObject) return;

    const canvas = this.previewCanvasRef.nativeElement;
    this.previewCtx = canvas.getContext('2d')!;

    // Set canvas size
    canvas.width = 128; // Larger size for preview
    canvas.height = 128;

    this.startPreviewAnimation();
  }

  private startPreviewAnimation(): void {
    if (this.previewAnimationFrameId) {
      cancelAnimationFrame(this.previewAnimationFrameId);
    }

    const animate = async () => {
      if (!this.selectedObject || !this.previewCtx) return;

      // Clear the preview canvas
      this.previewCtx.clearRect(0, 0, 128, 128);

      // Draw the space object at a larger size
      await this.spaceObjectService.drawSpaceObject(
        this.previewCtx,
        {
          ...this.selectedObject,
          coordinates: { x: 0, y: 0 }, // Center the object in the preview
        },
        128 // Larger size for preview
      );

      this.previewAnimationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  public handleContainerClick(event: MouseEvent): void {
    // Check if the click was directly on the container (not its children)
    if (event.target === event.currentTarget) {
      this.selectedObject = null;
      if (this.previewAnimationFrameId) {
        cancelAnimationFrame(this.previewAnimationFrameId);
        this.previewAnimationFrameId = null;
      }
    }
  }

  public closeMap(): void {
    this.close.emit();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.previewAnimationFrameId) {
      cancelAnimationFrame(this.previewAnimationFrameId);
    }
    if (this.destroyFn) {
      this.destroyFn();
    }
  }

  protected getEstimatedTravelTime(destination: SpaceObject): number {
    if (!this.currentState) return 0;

    return this.travelService.calculateTravelTime(
      this.currentState.currentLocation,
      destination.coordinates,
      this.currentState.speed
    );
  }

  protected getFormattedTravelTime(destination: SpaceObject): string {
    if (!this.currentState) return '0m 0s';

    const totalSeconds = this.travelService.calculateTravelTime(
      this.currentState.currentLocation,
      destination.coordinates,
      this.currentState.speed
    );

    return this.timeFormatService.formatTime(totalSeconds);
  }
}
