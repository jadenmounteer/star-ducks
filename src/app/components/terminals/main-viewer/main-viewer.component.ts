import {
  Component,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  OnInit,
  computed,
} from '@angular/core';
import { StarFieldService } from '../flight-control/course-plotter-map/stars/star-field.service';
import { WarpStarFieldService } from './warp-star-field-service/warp-star-field-service.service';
import { StarshipStateService } from '../../../services/starship-state.service';
import { CommonModule } from '@angular/common';
import { spaceObjects } from '../../../models/space-objects';
import { SpaceObjectService } from '../../../services/space-object.service';

@Component({
  selector: 'app-main-viewer',
  standalone: true,
  templateUrl: './main-viewer.component.html',
  styleUrl: './main-viewer.component.scss',
  imports: [[], CommonModule],
})
export class MainViewerComponent implements OnInit, OnChanges {
  @ViewChild('viewerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected starshipState = computed(() =>
    this.starshipStateService.getStarshipState()()
  );

  protected currentLocationObject = computed(() => {
    const state = this.starshipState();
    if (!state) return null;

    return spaceObjects.find(
      (obj) =>
        Math.abs(obj.coordinates.x - state.currentLocation.x) < 10 &&
        Math.abs(obj.coordinates.y - state.currentLocation.y) < 10
    );
  });

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private destroyFn: (() => void) | null = null;

  constructor(
    private starFieldService: StarFieldService,
    private warpStarFieldService: WarpStarFieldService,
    private starshipStateService: StarshipStateService,
    private spaceObjectService: SpaceObjectService
  ) {}

  ngOnInit() {
    console.log('Initial starship state:', this.starshipState()); // Debug log
  }

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.startAnimation();
    this.setupResizeObserver();
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Initialize both star fields
    this.starFieldService.initStarField(canvas.width, canvas.height);
    this.warpStarFieldService.initStarField(canvas.width, canvas.height);
  }

  private startAnimation(): void {
    const animate = () => {
      const canvas = this.canvasRef.nativeElement;
      const state = this.starshipState();

      if (state?.isMoving) {
        this.warpStarFieldService.drawStarField(
          this.ctx,
          canvas.width,
          canvas.height,
          state.speed || 1
        );
      } else {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.starFieldService.drawStarField(
          this.ctx,
          canvas.width,
          canvas.height,
          0,
          0
        );

        const locationObject = this.currentLocationObject();
        if (locationObject) {
          // Calculate responsive size based on canvas dimensions
          const minDimension = Math.min(canvas.width, canvas.height);
          const baseSize = minDimension * 0.2; // 30% of the smaller canvas dimension
          const scaleFactor = locationObject.size
            ? locationObject.size / 48
            : 1; // Assuming 48 is the base size
          const responsiveSize = baseSize * scaleFactor;

          const adjustedObject = {
            ...locationObject,
            coordinates: {
              x: canvas.width * 0.25,
              y: canvas.height * 0.3,
            },
            size: responsiveSize,
          };

          this.spaceObjectService.drawSpaceObject(this.ctx, adjustedObject);
        }
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private setupResizeObserver(): void {
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });

    const container = this.canvasRef.nativeElement.parentElement!;
    resizeObserver.observe(container);
    this.destroyFn = () => resizeObserver.disconnect();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.destroyFn) {
      this.destroyFn();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['starshipState']) {
      this.initializeCanvas();
      this.startAnimation();
    }
  }
}
