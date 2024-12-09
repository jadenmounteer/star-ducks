import { TerritoryId } from './territory';

export interface SpaceObject {
  id: string;
  name: string;
  type: 'planet' | 'star' | 'station';
  coordinates: { x: number; y: number };
  sprite: string;
  animationFrames: number;
  description?: string;
  size?: number;
  territory: TerritoryId;
}
