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
      brightness: Math.random() * 0.3 + 0.7,
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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    this.stars.forEach((star) => {
      star.z -= star.speed * warpFactor * 10;

      if (star.z < 1) {
        Object.assign(star, this.createStar(width, height));
        star.x = Math.random() * width;
        star.y = Math.random() * height;
        star.z = width;
      }

      const projectedX = (star.x - centerX) * (width / star.z) + centerX;
      const projectedY = (star.y - centerY) * (width / star.z) + centerY;

      star.length = Math.min(200, (warpFactor * 200) / (star.z * 0.1));

      ctx.beginPath();
      ctx.strokeStyle = `rgba(121, 240, 254, ${star.brightness})`;
      ctx.shadowColor = 'rgba(121, 240, 254, 0.8)';
      ctx.shadowBlur = 15;
      ctx.lineWidth = Math.min(12, (width / star.z) * 1.5);

      ctx.moveTo(projectedX, projectedY);
      ctx.lineTo(
        projectedX + (star.length * (projectedX - centerX)) / width,
        projectedY + (star.length * (projectedY - centerY)) / height
      );

      ctx.stroke();
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }
}
