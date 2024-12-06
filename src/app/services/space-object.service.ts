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
    displaySize: number = 32
  ): Promise<void> {
    try {
      const sprite = await this.loadSprite(object.sprite);
      const frameWidth = sprite.width / object.animationFrames;
      const frameHeight = sprite.height;
      const currentFrame =
        Math.floor(Date.now() / 200) % object.animationFrames;

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        sprite,
        currentFrame * frameWidth,
        0,
        frameWidth,
        frameHeight,
        object.coordinates.x,
        object.coordinates.y,
        displaySize,
        displaySize
      );
    } catch (error) {
      console.error('Failed to load sprite:', error);
    }
  }

  isPointInObject(
    x: number,
    y: number,
    object: SpaceObject,
    size: number = 32
  ): boolean {
    return (
      x >= object.coordinates.x &&
      x <= object.coordinates.x + size &&
      y >= object.coordinates.y &&
      y <= object.coordinates.y + size
    );
  }
}
