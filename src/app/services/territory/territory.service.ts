import { Injectable } from '@angular/core';
import { TerritoryId, Territory } from '../../models/territory';
import { BOUNDS } from '../../components/terminals/flight-control/course-plotter-map/course-plotter-map.component';

@Injectable({
  providedIn: 'root',
})
export class TerritoryService {
  private territories: Record<TerritoryId, Territory> = {
    federation: {
      id: 'federation',
      name: 'United Federation of Ducks',
      color: 'rgba(0, 0, 255, 0.1)',
      borderColor: 'rgba(0, 0, 255, 0.5)',
      bounds: {
        minX: -1800,
        maxX: 4000,
        minY: -2000,
        maxY: 4500,
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
