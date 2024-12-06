import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { SpaceObject } from '../../../../models/space-object';
import { Star } from './stars/star';

@Component({
  standalone: true,
  selector: 'app-course-plotter-map',
  templateUrl: './course-plotter-map.component.html',
  styleUrls: ['./course-plotter-map.component.scss'],
})
export class CoursePlotterMapComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() spaceObjects: SpaceObject[] = [];
  @Output() destinationSelected = new EventEmitter<SpaceObject>();

  private spriteCache: { [key: string]: HTMLImageElement } = {};

  private ctx!: CanvasRenderingContext2D;
  public selectedObject: SpaceObject | null = null;
  public isFullScreen = false;

  private stars: Star[] = [];
  private readonly NUM_STARS = 100;
  private readonly NUM_PARTICLES = 50;
  private animationFrameId: number | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.initStarField();
    this.startAnimation();
  }

  private initStarField(): void {
    const canvas = this.canvasRef.nativeElement;
    this.stars = [];

    // Create background stars (slower, larger)
    for (let i = 0; i < this.NUM_STARS; i++) {
      this.stars.push(
        new Star(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 1.5 + 0.5, // Size between 0.5 and 2
          Math.random() * 0.5 + 0.5, // Initial brightness
          0.1 // Slow movement
        )
      );
    }

    // Create particle stars (faster, smaller)
    for (let i = 0; i < this.NUM_PARTICLES; i++) {
      this.stars.push(
        new Star(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 0.5 + 0.1, // Smaller size
          Math.random() * 0.3 + 0.7, // Brighter
          Math.random() * 0.5 + 0.5 // Faster movement
        )
      );
    }
  }

  private drawStarField(): void {
    const canvas = this.canvasRef.nativeElement;

    // Update and draw all stars
    this.stars.forEach((star) => {
      star.update(canvas.width, canvas.height);
      star.draw(this.ctx);
    });
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement as HTMLElement;

    if (!container) {
      console.error('Canvas container not found');
      return;
    }

    if (this.isFullScreen) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      // Now TypeScript knows container is HTMLElement which has clientWidth/Height
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Reinitialize star field when canvas is resized
    this.initStarField();
  }

  private startAnimation(): void {
    const animate = () => {
      this.ctx.clearRect(
        0,
        0,
        this.canvasRef.nativeElement.width,
        this.canvasRef.nativeElement.height
      );

      // Draw star field first (background layer)
      this.drawStarField();

      // Draw grid on top of star field
      this.drawGrid();

      // Draw space objects last
      this.spaceObjects.forEach((object) => {
        this.drawSpaceObject(object);
      });

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    const gridSize = 20;
    const width = this.canvasRef.nativeElement.width;
    const height = this.canvasRef.nativeElement.height;

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  private async loadSprite(spritePath: string): Promise<HTMLImageElement> {
    if (this.spriteCache[spritePath]) {
      return Promise.resolve(this.spriteCache[spritePath]);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.spriteCache[spritePath] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = spritePath;
    });
  }

  private async drawSpaceObject(object: SpaceObject): Promise<void> {
    try {
      const sprite = await this.loadSprite(object.sprite);

      // Calculate dimensions based on your sprite sheet
      const FRAME_WIDTH = sprite.width / object.animationFrames; // 640px / 2 = 320px per frame
      const FRAME_HEIGHT = sprite.height; // 320px

      // Define the display size you want (scaled down from original)
      const DISPLAY_SIZE = 32; // or whatever size you want the planet to appear as

      // Calculate current frame
      const currentFrame =
        Math.floor(Date.now() / 200) % object.animationFrames;

      // Disable image smoothing for crisp pixels
      this.ctx.imageSmoothingEnabled = false;

      this.ctx.drawImage(
        sprite,
        currentFrame * FRAME_WIDTH, // Source X (0 or 320 depending on frame)
        0, // Source Y
        FRAME_WIDTH, // Source Width (320px)
        FRAME_HEIGHT, // Source Height (320px)
        object.coordinates.x, // Destination X
        object.coordinates.y, // Destination Y
        DISPLAY_SIZE, // Destination Width (scaled down)
        DISPLAY_SIZE // Destination Height (scaled down)
      );
    } catch (error) {
      console.error('Failed to load sprite:', error);
    }
  }

  public handleClick(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedObject = this.spaceObjects.find((object) =>
      this.isPointInObject(x, y, object)
    );

    if (clickedObject) {
      this.selectedObject = clickedObject;
      this.destinationSelected.emit(clickedObject);
    }
  }

  private isPointInObject(x: number, y: number, object: SpaceObject): boolean {
    // Simple square hit detection - can be improved based on your needs
    const size = 16; // Assuming 16x16 pixel objects
    return (
      x >= object.coordinates.x &&
      x <= object.coordinates.x + size &&
      y >= object.coordinates.y &&
      y <= object.coordinates.y + size
    );
  }

  public toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
    this.resizeCanvas();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
