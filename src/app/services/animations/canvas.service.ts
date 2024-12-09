import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    viewportX: number,
    viewportY: number
  ): void {
    const gridSize = 32;
    const offsetX = viewportX % gridSize;
    const offsetY = viewportY % gridSize;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = -offsetX; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = -offsetY; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  clearCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.clearRect(0, 0, width, height);
  }
}
