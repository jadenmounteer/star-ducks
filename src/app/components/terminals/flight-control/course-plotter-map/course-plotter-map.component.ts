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

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.startAnimation();
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    if (this.isFullScreen) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      canvas.width = 400;
      canvas.height = 300;
    }
  }

  private startAnimation(): void {
    const animate = () => {
      this.ctx.clearRect(
        0,
        0,
        this.canvasRef.nativeElement.width,
        this.canvasRef.nativeElement.height
      );
      this.drawGrid();

      this.spaceObjects.forEach((object) => {
        this.drawSpaceObject(object);
      });

      requestAnimationFrame(animate);
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
}
