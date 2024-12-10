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
    color: string = '#dddddd',
    objectSize: number = 48,
    isStarship: boolean = false
  ): void {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    // Adjust target position to center of object
    // Only add size offset for space objects, not for starship
    const targetX =
      targetPosition.x - viewportPosition.x + (isStarship ? 0 : objectSize / 2);
    const targetY =
      targetPosition.y - viewportPosition.y + (isStarship ? 0 : objectSize / 2);

    // Calculate angle to target
    const angle = Math.atan2(targetY - centerY, targetX - centerX);

    // Check if target is off screen
    if (
      targetX < 0 ||
      targetX > canvasWidth ||
      targetY < 0 ||
      targetY > canvasHeight
    ) {
      // Draw at screen edge
      const radius = Math.min(canvasWidth, canvasHeight) * 0.45;
      const arrowX = centerX + Math.cos(angle) * radius;
      const arrowY = centerY + Math.sin(angle) * radius;

      this.drawArrow(ctx, arrowX, arrowY, angle, color);
    } else {
      // Draw above the object's center
      const arrowY = targetY - objectSize / 2 - 20; // 20px above object
      this.drawArrow(ctx, targetX, arrowY, Math.PI / 2, color); // Point downward
    }
  }

  private drawArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    color: string
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

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
