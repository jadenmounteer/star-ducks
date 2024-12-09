import { Injectable } from '@angular/core';
import { StarshipIcon } from '../../models/starship-icon';
import { SpaceObject } from '../../models/space-object';

@Injectable({
  providedIn: 'root',
})
export class StarshipIconService {
  drawStarship(
    ctx: CanvasRenderingContext2D,
    starship: StarshipIcon,
    viewportX: number,
    viewportY: number
  ): void {
    const adjustedX = starship.coordinates.x - viewportX;
    const adjustedY = starship.coordinates.y - viewportY;

    // Draw the starship sprite
    // For now, let's draw a simple triangle
    ctx.save();
    ctx.translate(adjustedX, adjustedY);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-5, 10);
    ctx.lineTo(5, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawCourseLine(
    ctx: CanvasRenderingContext2D,
    starship: StarshipIcon,
    destination: SpaceObject,
    viewportX: number,
    viewportY: number
  ): void {
    const startX = starship.coordinates.x - viewportX;
    const startY = starship.coordinates.y - viewportY;
    const endX = destination.coordinates.x - viewportX;
    const endY = destination.coordinates.y - viewportY;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  moveTowardsDestination(
    starship: StarshipIcon,
    destination: SpaceObject
  ): boolean {
    const dx = destination.coordinates.x - starship.coordinates.x;
    const dy = destination.coordinates.y - starship.coordinates.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < starship.speed) {
      starship.coordinates = { ...destination.coordinates };
      return true;
    }

    const angle = Math.atan2(dy, dx);
    starship.coordinates.x += Math.cos(angle) * starship.speed;
    starship.coordinates.y += Math.sin(angle) * starship.speed;
    return false;
  }
}
