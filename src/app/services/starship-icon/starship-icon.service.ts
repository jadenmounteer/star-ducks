import { Injectable } from '@angular/core';
import { StarshipIcon } from '../../models/starship-icon';
import { SpaceObject } from '../../models/space-object';

@Injectable({
  providedIn: 'root',
})
export class StarshipIconService {
  private spriteCache: { [key: string]: HTMLImageElement } = {};
  private async loadSprite(spritePath: string): Promise<HTMLImageElement> {
    if (this.spriteCache[spritePath]) {
      return Promise.resolve(this.spriteCache[spritePath]);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.spriteCache[spritePath] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = spritePath;
    });
  }

  async drawStarship(
    ctx: CanvasRenderingContext2D,
    starship: StarshipIcon,
    viewportX: number,
    viewportY: number
  ): Promise<void> {
    try {
      const sprite = await this.loadSprite(starship.sprite);
      const frameWidth = sprite.width / starship.animationFrames;
      const frameHeight = sprite.height;
      const adjustedX = starship.coordinates.x - viewportX;
      const adjustedY = starship.coordinates.y - viewportY;

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        sprite,
        0,
        0,
        frameWidth,
        frameHeight,
        adjustedX - starship.size / 2,
        adjustedY - starship.size / 2,
        starship.size,
        starship.size
      );
    } catch (error) {
      console.error('Failed to load starship sprite:', error);
    }
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
