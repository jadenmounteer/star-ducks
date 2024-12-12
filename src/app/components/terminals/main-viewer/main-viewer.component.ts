import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
  OnInit,
  computed,
} from '@angular/core';
import { StarshipState } from '../../../models/starship-state';
import { StarFieldService } from '../flight-control/course-plotter-map/stars/star-field.service';
import { WarpStarFieldService } from './warp-star-field-service/warp-star-field-service.service';
import { FlightControlComponent } from '../flight-control/flight-control/flight-control.component';
import { StarshipStateService } from '../../../services/starship-state.service';

@Component({
  selector: 'app-main-viewer',
  standalone: true,
  templateUrl: './main-viewer.component.html',
  styleUrl: './main-viewer.component.scss',
  imports: [FlightControlComponent],
})
export class MainViewerComponent implements OnInit, OnChanges {
  @ViewChild('viewerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected starshipState = computed(() =>
    this.starshipStateService.getStarshipState()()
  );

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private destroyFn: (() => void) | null = null;

  constructor(
    private starFieldService: StarFieldService,
    private warpStarFieldService: WarpStarFieldService,
    private starshipStateService: StarshipStateService
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
        // Use warp effect when moving
        this.warpStarFieldService.drawStarField(
          this.ctx,
          canvas.width,
          canvas.height,
          state.speed || 1
        );
      } else {
        // Clear the canvas completely for normal stars
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw normal starfield when stationary
        this.starFieldService.drawStarField(
          this.ctx,
          canvas.width,
          canvas.height,
          0,
          0
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
