import { Injectable } from '@angular/core';
import { SpaceObject } from '../models/space-object';

@Injectable({
  providedIn: 'root',
})
export class SpaceObjectService {
  private spriteCache: { [key: string]: HTMLImageElement } = {};

  async loadSprite(spritePath: string): Promise<HTMLImageElement> {
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

  async drawSpaceObject(
    ctx: CanvasRenderingContext2D,
    object: SpaceObject,
    displaySize?: number,
    frameRate: number = 500
  ): Promise<void> {
    try {
      const sprite = await this.loadSprite(object.sprite);
      const frameWidth = sprite.width / object.animationFrames;
      const frameHeight = sprite.height;
      const currentFrame =
        Math.floor(Date.now() / frameRate) % object.animationFrames;
      const size = displaySize || object.size || 48; // Use provided size, object size, or default

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        sprite,
        currentFrame * frameWidth,
        0,
        frameWidth,
        frameHeight,
        object.coordinates.x,
        object.coordinates.y,
        size,
        size
      );
    } catch (error) {
      console.error('Failed to load sprite:', error);
    }
  }

  isPointInObject(
    x: number,
    y: number,
    object: SpaceObject,
    displaySize?: number
  ): boolean {
    const size = displaySize || object.size || 48;
    const padding = 20; // Extra padding for touch devices
    const radius = size / 2 + padding;

    // Calculate distance from click/touch point to object center
    const centerX = object.coordinates.x + size / 2;
    const centerY = object.coordinates.y + size / 2;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= radius;
  }
}
