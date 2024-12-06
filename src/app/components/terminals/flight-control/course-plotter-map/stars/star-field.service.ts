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
    canvasHeight: number
  ): void {
    this.stars.forEach((star) => {
      star.update(canvasWidth, canvasHeight);
      star.draw(ctx);
    });
  }
}
