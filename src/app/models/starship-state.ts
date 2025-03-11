import { ShipSystem } from './ship-system';

export interface StarshipState {
  currentLocation: {
    x: number;
    y: number;
  };
  destinationLocation?: {
    x: number;
    y: number;
  };
  isMoving: boolean;
  departureTime?: number; // timestamp when journey started
  arrivalTime?: number; // estimated arrival timestamp
  speed: number; // current warp speed (1-9)
  systems: ShipSystem[];
}
