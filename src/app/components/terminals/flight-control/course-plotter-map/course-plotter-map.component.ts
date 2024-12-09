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
import { StarFieldService } from './stars/star-field.service';
import { CanvasService } from '../../../../services/animations/canvas.service';
import { TerritoryService } from '../../../../services/territory/territory.service';
import { StarshipIcon } from '../../../../models/starship-icon';
import { StarshipIconService } from '../../../../services/starship-icon/starship-icon.service';
import { StarshipState } from '../../../../models/starship-state';
import { GameSessionService } from '../../../../services/game-session.service';

@Component({
  standalone: true,
  selector: 'app-course-plotter-map',
  templateUrl: './course-plotter-map.component.html',
  styleUrls: ['./course-plotter-map.component.scss'],
})
export class CoursePlotterMapComponent implements AfterViewInit, OnDestroy {
  private territoryService = inject(TerritoryService);
  private starshipIconService = inject(StarshipIconService);
  private gameSessionService = inject(GameSessionService);

  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas') previewCanvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() spaceObjects: SpaceObject[] = [];
  @Input() set starshipState(state: StarshipState) {
    if (state) {
      // Always set the current position directly
      this.starship.coordinates = state.currentLocation;

      // Only set up movement if we have both isMoving and a destinationLocation
      if (state.isMoving && state.destinationLocation) {
        this.isMoving = true;
        this.destinationObject =
          this.spaceObjects.find(
            (obj) =>
              obj.coordinates.x === state.destinationLocation?.x &&
              obj.coordinates.y === state.destinationLocation?.y
          ) || null;
      } else {
        // If we're not moving or don't have a destination, reset movement state
        this.isMoving = false;
        this.destinationObject = null;
      }
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

  protected showTerritories = false;

  private starship: StarshipIcon = {
    coordinates: { x: 0, y: 0 },
    sprite: 'assets/sprites/star-ships/enterprise.png',
    animationFrames: 1,
    size: 32,
    speed: 2,
  };
  private destinationObject: SpaceObject | null = null;
  private isMoving = false;

  private viewport = { x: 0, y: 0 };
  private readonly BOUNDS = {
    minX: -1000,
    maxX: 1000,
    minY: -1000,
    maxY: 1000,
  };
  protected isDragging = false;
  private lastMousePos = { x: 0, y: 0 };

  constructor(
    private starFieldService: StarFieldService,
    private canvasService: CanvasService,
    private spaceObjectService: SpaceObjectService
  ) {}

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.startAnimation();
    this.setupResizeObserver();
  }

  private async updateStarshipLocation() {
    await this.gameSessionService.updateStarshipState(this.gameSessionId, {
      currentLocation: this.starship.coordinates,
      destinationLocation: this.destinationObject?.coordinates,
      isMoving: this.isMoving,
    });
  }

  protected setDestinationCourse(): void {
    if (this.selectedObject) {
      this.destinationObject = this.selectedObject;
      this.isMoving = true;
    }
  }
  // Add these methods to the component
  public startDrag(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
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

    // Update viewport position with bounds checking
    this.viewport.x = Math.max(
      this.BOUNDS.minX,
      Math.min(this.BOUNDS.maxX, this.viewport.x - deltaX)
    );
    this.viewport.y = Math.max(
      this.BOUNDS.minY,
      Math.min(this.BOUNDS.maxY, this.viewport.y - deltaY)
    );

    this.lastMousePos = currentPos;
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.starFieldService.initStarField(canvas.width, canvas.height);
  }

  private startAnimation(): void {
    const animate = () => {
      const canvas = this.canvasRef.nativeElement;

      this.canvasService.clearCanvas(this.ctx, canvas.width, canvas.height);

      if (this.showTerritories) {
        this.territoryService.drawTerritories(
          this.ctx,
          this.viewport.x,
          this.viewport.y,
          canvas.width,
          canvas.height
        );
      }

      // Draw course line if destination is set
      if (this.destinationObject) {
        this.starshipIconService.drawCourseLine(
          this.ctx,
          this.starship,
          this.destinationObject,
          this.viewport.x,
          this.viewport.y
        );
      }

      // Move starship if needed
      if (this.isMoving && this.destinationObject) {
        const hasArrived = this.starshipIconService.moveTowardsDestination(
          this.starship,
          this.destinationObject
        );
        if (hasArrived) {
          this.isMoving = false;
          this.destinationObject = null;
          this.updateStarshipLocation();
        }
      }

      this.starFieldService.drawStarField(
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

      this.starshipIconService.drawStarship(
        this.ctx,
        this.starship,
        this.viewport.x,
        this.viewport.y,
        this.destinationObject || undefined
      );

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
}
