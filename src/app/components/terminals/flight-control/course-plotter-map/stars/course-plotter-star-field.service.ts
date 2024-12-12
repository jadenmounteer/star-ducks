import { Injectable } from '@angular/core';
import { Star } from './star';

@Injectable({
  providedIn: 'root',
})
export class CoursePlotterStarFieldService {
  private stars: Star[] = [];
  private readonly NUM_STARS = 100000; // Increased back to 100,000 stars
  private readonly BOUNDS = {
    minX: -5000,
    maxX: 5000,
    minY: -5000,
    maxY: 5000,
  };

  initStarField(width: number, height: number): void {
    this.stars = [];
    for (let i = 0; i < this.NUM_STARS; i++) {
      this.stars.push(
        new Star(
          Math.random() * (this.BOUNDS.maxX - this.BOUNDS.minX) +
            this.BOUNDS.minX,
          Math.random() * (this.BOUNDS.maxY - this.BOUNDS.minY) +
            this.BOUNDS.minY,
          Math.random() * 2 + 0.5, // size
          Math.random() * 0.5 + 0.5, // brightness
          Math.random() * 0.5 + 0.1, // speed
          Math.random() * 0.05 // twinkle speed
        )
      );
    }
  }

  drawStarField(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    viewportX: number,
    viewportY: number
  ): void {
    this.stars.forEach((star) => {
      const drawX = star.x - viewportX;
      const drawY = star.y - viewportY;

      // Only draw stars that are within the viewport
      if (
        drawX >= -10 &&
        drawX <= width + 10 &&
        drawY >= -10 &&
        drawY <= height + 10
      ) {
        // Update star's twinkle effect
        star.update(width, height);
        // Draw the star
        star.draw(ctx, drawX, drawY);
      }
    });
  }
}
