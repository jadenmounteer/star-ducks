import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DirectionalArrowService {
  public drawDirectionalArrow(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    targetPosition: { x: number; y: number },
    viewportPosition: { x: number; y: number },
    color: string = '#00ff00'
  ): void {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const targetX = targetPosition.x - viewportPosition.x;
    const targetY = targetPosition.y - viewportPosition.y;

    // If target is off screen, draw arrow at screen edge
    if (
      targetX < 0 ||
      targetX > canvasWidth ||
      targetY < 0 ||
      targetY > canvasHeight
    ) {
      // Calculate angle to target
      const angle = Math.atan2(targetY - centerY, targetX - centerX);

      // Calculate arrow position at screen edge
      const radius = Math.min(canvasWidth, canvasHeight) * 0.45;
      const arrowX = centerX + Math.cos(angle) * radius;
      const arrowY = centerY + Math.sin(angle) * radius;

      // Draw arrow
      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(angle);

      // Arrow shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-15, -10);
      ctx.lineTo(-15, 10);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      ctx.restore();
    }
  }
}
