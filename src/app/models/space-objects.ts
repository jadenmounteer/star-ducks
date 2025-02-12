import { SpaceObject } from './space-object';

export const spaceObjects: SpaceObject[] = [
  {
    id: '1',
    name: 'Earth',
    type: 'planet',
    coordinates: { x: 100, y: 100 },
    sprite: 'assets/sprites/space-objects/earth.png',
    animationFrames: 2,
    size: 48,
    description: 'Home planet of Earth ducks.',
    territory: 'federation',
  },
  {
    id: '2',
    name: 'Dulcan',
    type: 'planet',
    coordinates: { x: 1750, y: 1350 },
    sprite: 'assets/sprites/space-objects/dulcan.png',
    animationFrames: 2,
    size: 96,
    description:
      'Home planet of the Dulcans. A peaceful species with no comprehension of what a dad joke is.',
    territory: 'federation',
  },
  {
    id: '3',
    name: 'Helios',
    type: 'star',
    coordinates: { x: 1600, y: 450 },
    sprite: 'assets/sprites/space-objects/helios.png',
    animationFrames: 2,
    size: 192, // Bigger size for the star
    description: "Earth's star.",
    territory: 'federation',
  },
  // Add more space objects...
];
