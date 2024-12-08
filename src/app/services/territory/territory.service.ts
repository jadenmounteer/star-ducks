import { Injectable } from '@angular/core';
import { TerritoryId, Territory } from '../../models/territory';

@Injectable({
  providedIn: 'root',
})
export class TerritoryService {
  private readonly SPACE_BOUNDS = {
    minX: -1000,
    maxX: 3000,
    minY: -1000,
    maxY: 3000,
  };

  private territories: Record<TerritoryId, Territory> = {
    federation: {
      id: 'federation',
      name: 'United Federation of Ducks',
      color: 'rgba(0, 0, 255, 0.1)',
      borderColor: 'rgba(0, 0, 255, 0.5)',
      bounds: {
        minX: -500,
        maxX: 1000,
        minY: -500,
        maxY: 1000,
      },
    },

    neutral: {
      id: 'neutral',
      name: 'Neutral Space',
      color: 'rgba(200, 200, 200, 0.1)',
      borderColor: 'rgba(200, 200, 200, 0.5)',
      bounds: {
        minX: this.SPACE_BOUNDS.minX,
        maxX: this.SPACE_BOUNDS.maxX,
        minY: this.SPACE_BOUNDS.minY,
        maxY: this.SPACE_BOUNDS.maxY,
      },
    },
  };

  drawTerritories(
    ctx: CanvasRenderingContext2D,
    viewportX: number,
    viewportY: number,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    Object.values(this.territories).forEach((territory) => {
      const adjustedBounds = {
        minX: territory.bounds.minX - viewportX,
        maxX: territory.bounds.maxX - viewportX,
        minY: territory.bounds.minY - viewportY,
        maxY: territory.bounds.maxY - viewportY,
      };

      // Draw territory background
      ctx.fillStyle = territory.color;
      ctx.fillRect(
        adjustedBounds.minX,
        adjustedBounds.minY,
        adjustedBounds.maxX - adjustedBounds.minX,
        adjustedBounds.maxY - adjustedBounds.minY
      );

      // Draw territory borders
      ctx.strokeStyle = territory.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        adjustedBounds.minX,
        adjustedBounds.minY,
        adjustedBounds.maxX - adjustedBounds.minX,
        adjustedBounds.maxY - adjustedBounds.minY
      );
    });
  }

  getTerritoryForPosition(x: number, y: number): TerritoryId {
    const territory = Object.values(this.territories).find(
      (t) =>
        x >= t.bounds.minX &&
        x <= t.bounds.maxX &&
        y >= t.bounds.minY &&
        y <= t.bounds.maxY
    );
    return (territory?.id as TerritoryId) || ('neutral' as TerritoryId);
  }
}
