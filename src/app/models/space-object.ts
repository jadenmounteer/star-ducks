// Space objects that are rendered on the Course Plotter map
export interface SpaceObject {
  id: string;
  name: string;
  type: 'planet' | 'star' | 'station';
  coordinates: { x: number; y: number };
  sprite: string; // Path to sprite sheet
  animationFrames: number;
  description?: string;
}
