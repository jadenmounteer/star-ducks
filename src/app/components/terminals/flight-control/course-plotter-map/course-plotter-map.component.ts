import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { SpaceObject } from '../../../../models/space-object';

import { SpaceObjectService } from '../../../../services/space-object.service';
import { StarFieldService } from './stars/star-field.service';
import { CanvasService } from '../../../../services/animations/canvas.service';

@Component({
  standalone: true,
  selector: 'app-course-plotter-map',
  templateUrl: './course-plotter-map.component.html',
  styleUrls: ['./course-plotter-map.component.scss'],
})
export class CoursePlotterMapComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() spaceObjects: SpaceObject[] = [];
  @Output() destinationSelected = new EventEmitter<SpaceObject>();

  private ctx!: CanvasRenderingContext2D;
  public selectedObject: SpaceObject | null = null;
  public isFullScreen = false;
  private animationFrameId: number | null = null;
  private destroyFn: (() => void) | null = null;

  constructor(
    private starFieldService: StarFieldService,
    private canvasService: CanvasService,
    private spaceObjectService: SpaceObjectService
  ) {}

  ngOnInit(): void {}

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
    const container = canvas.parentElement as HTMLElement;

    if (!container) return;

    if (this.isFullScreen) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    this.starFieldService.initStarField(canvas.width, canvas.height);
  }

  private startAnimation(): void {
    const animate = () => {
      const canvas = this.canvasRef.nativeElement;

      this.canvasService.clearCanvas(this.ctx, canvas.width, canvas.height);
      this.starFieldService.drawStarField(
        this.ctx,
        canvas.width,
        canvas.height
      );
      this.canvasService.drawGrid(this.ctx, canvas.width, canvas.height);

      this.spaceObjects.forEach((object) => {
        this.spaceObjectService.drawSpaceObject(this.ctx, object);
      });

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private setupResizeObserver(): void {
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });

    const container = this.canvasRef.nativeElement.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }

    this.destroyFn = () => resizeObserver.disconnect();
  }

  public handleClick(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedObject = this.spaceObjects.find((object) =>
      this.spaceObjectService.isPointInObject(x, y, object)
    );

    if (clickedObject) {
      this.selectedObject = clickedObject;
      this.destinationSelected.emit(clickedObject);
    }
  }

  public toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
    this.resizeCanvas();
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
