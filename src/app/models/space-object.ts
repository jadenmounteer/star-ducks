// Space objects that are rendered on the Course Plotter map
export interface SpaceObject {
  id: string;
  name: string;
  type: 'planet' | 'star' | 'station';
  coordinates: { x: number; y: number };
  sprite: string;
  animationFrames: number;
  description?: string;
  size?: number; // Default size will be 48 if not specified
}
