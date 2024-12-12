import { Injectable } from '@angular/core';

interface WarpStar {
  x: number;
  y: number;
  z: number;
  brightness: number;
  speed: number;
  length: number;
}

@Injectable({
  providedIn: 'root',
})
export class WarpStarFieldService {
  private stars: WarpStar[] = [];
  private readonly NUM_STARS = 200;

  initStarField(width: number, height: number): void {
    this.stars = [];
    for (let i = 0; i < this.NUM_STARS; i++) {
      this.stars.push(this.createStar(width, height));
    }
  }

  private createStar(width: number, height: number): WarpStar {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * width,
      brightness: Math.random() * 0.2 + 0.8,
      speed: Math.random() * 2 + 1,
      length: 0,
    };
  }

  drawStarField(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    warpFactor: number
  ): void {
    // Even more transparent fade effect for brighter trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    this.stars.forEach((star) => {
      // Calculate star movement
      star.z -= star.speed * warpFactor * 10;

      // Reset star if it goes off screen
      if (star.z < 1) {
        Object.assign(star, this.createStar(width, height));
        star.x = Math.random() * width;
        star.y = Math.random() * height;
        star.z = width;
      }

      // Project star position
      const projectedX = (star.x - centerX) * (width / star.z) + centerX;
      const projectedY = (star.y - centerY) * (width / star.z) + centerY;

      // Calculate length based on speed and z-position
      star.length = Math.min(20, (warpFactor * 50) / (star.z * 0.1));

      // Much brighter star streaks
      ctx.beginPath();
      ctx.strokeStyle = `rgba(180, 230, 255, ${star.brightness})`;
      ctx.lineWidth = Math.min(5, (width / star.z) * 0.8);

      // Draw line from current position to a point behind
      ctx.moveTo(projectedX, projectedY);
      ctx.lineTo(
        projectedX + (star.length * (projectedX - centerX)) / width,
        projectedY + (star.length * (projectedY - centerY)) / height
      );

      ctx.stroke();
    });
  }
}
