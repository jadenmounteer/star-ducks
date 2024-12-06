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
  selector: 'app-course-plotter',
  templateUrl: './course-plotter-map.component.html',
  styleUrls: ['./course-plotter-map.component.scss'],
})
export class CoursePlotterComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() spaceObjects: SpaceObject[] = [];
  @Output() destinationSelected = new EventEmitter<SpaceObject>();

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

  private drawSpaceObject(object: SpaceObject): void {
    const sprite = new Image();
    sprite.src = object.sprite;

    const frameWidth = sprite.width / object.animationFrames;
    const currentFrame = Math.floor(Date.now() / 100) % object.animationFrames;

    this.ctx.drawImage(
      sprite,
      currentFrame * frameWidth,
      0,
      frameWidth,
      sprite.height,
      object.coordinates.x,
      object.coordinates.y,
      frameWidth,
      sprite.height
    );
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
