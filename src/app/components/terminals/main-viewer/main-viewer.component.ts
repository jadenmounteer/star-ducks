import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FlightControlComponent } from '../flight-control/flight-control/flight-control.component';
import { StarshipState } from '../../../models/starship-state';
import { StarFieldService } from '../flight-control/course-plotter-map/stars/star-field.service';

@Component({
  selector: 'app-main-viewer',
  standalone: true,
  imports: [FlightControlComponent],
  templateUrl: './main-viewer.component.html',
  styleUrl: './main-viewer.component.scss',
})
export class MainViewerComponent {
  @ViewChild('viewerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() starshipState!: StarshipState;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private destroyFn: (() => void) | null = null;
  private viewport = { x: 0, y: 0 };

  constructor(private starFieldService: StarFieldService) {}

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.startAnimation();
    this.setupResizeObserver();
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();

    // Center viewport on current starship position
    if (this.starshipState) {
      this.viewport = {
        x: this.starshipState.currentLocation.x - canvas.width / 2,
        y: this.starshipState.currentLocation.y - canvas.height / 2,
      };
    }
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    this.starFieldService.initStarField(canvas.width, canvas.height);
  }

  private startAnimation(): void {
    const animate = () => {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update viewport based on ship's current position
      if (this.starshipState) {
        this.viewport = {
          x: this.starshipState.currentLocation.x - canvas.width / 2,
          y: this.starshipState.currentLocation.y - canvas.height / 2,
        };
      }

      this.starFieldService.drawStarField(
        this.ctx,
        canvas.width,
        canvas.height,
        this.viewport.x,
        this.viewport.y
      );

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
}
