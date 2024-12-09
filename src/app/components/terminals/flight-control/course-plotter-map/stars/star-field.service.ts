import { Injectable } from '@angular/core';
import { Star } from './star';

@Injectable({
  providedIn: 'root',
})
export class StarFieldService {
  private stars: Star[] = [];
  private readonly NUM_STARS = 200;
  private readonly NUM_PARTICLES = 1000;

  initStarField(canvasWidth: number, canvasHeight: number): void {
    this.stars = [];

    // Create background stars (slower, larger)
    for (let i = 0; i < this.NUM_STARS; i++) {
      this.stars.push(
        new Star(
          Math.random() * canvasWidth,
          Math.random() * canvasHeight,
          Math.random() * 1.5 + 0.5,
          Math.random() * 0.5 + 0.5,
          0.1
        )
      );
    }

    // Create particle stars (faster, smaller)
    for (let i = 0; i < this.NUM_PARTICLES; i++) {
      this.stars.push(
        new Star(
          Math.random() * canvasWidth,
          Math.random() * canvasHeight,
          Math.random() * 0.5 + 0.1,
          Math.random() * 0.3 + 0.7,
          Math.random() * 0.5 + 0.5
        )
      );
    }
  }

  drawStarField(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    viewportX: number,
    viewportY: number
  ): void {
    this.stars.forEach((star) => {
      // Adjust star position based on viewport
      const adjustedX = star.x - viewportX * 0.1; // Parallax effect
      const adjustedY = star.y - viewportY * 0.1;

      // Wrap stars around the viewport
      const wrappedX = ((adjustedX % canvasWidth) + canvasWidth) % canvasWidth;
      const wrappedY =
        ((adjustedY % canvasHeight) + canvasHeight) % canvasHeight;

      star.update(canvasWidth, canvasHeight);
      star.draw(ctx, wrappedX, wrappedY);
    });
  }
}
