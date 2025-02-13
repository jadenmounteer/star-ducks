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
    territory: 'Federation',
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
    territory: 'Federation',
  },
  {
    id: '3',
    name: 'Helios',
    type: 'star',
    coordinates: { x: 1600, y: 450 },
    sprite: 'assets/sprites/space-objects/helios.png',
    animationFrames: 2,
    size: 300, // Bigger size for the star
    description: "Earth's star.",
    territory: 'Federation',
  },
  {
    id: '4',
    name: 'Duckulus',
    type: 'planet',
    coordinates: { x: 5000, y: -3350 },
    sprite: 'assets/sprites/space-objects/duckulus.png',
    animationFrames: 2,
    size: 70,
    description: 'Home planet of the Duckulans',
    territory: 'Duckulan',
  },
  {
    id: '5',
    name: 'Hathor',
    type: 'asteroid',
    coordinates: { x: 3900, y: -1800 },
    sprite: 'assets/sprites/space-objects/hathor.png',
    animationFrames: 2,
    size: 30,
    description: 'Large asteroid housing a Federation research station.',
    territory: 'Federation',
  },
  {
    id: '6',
    name: 'Duckson',
    type: 'star',
    coordinates: { x: 4100, y: -1950 },
    sprite: 'assets/sprites/space-objects/helios.png',
    animationFrames: 2,
    size: 120,
    description:
      'Small star in the neutral zone between the Federation and the Duckulan Empire.',
    territory: 'Federation',
  },
  // Add more space objects...
];
