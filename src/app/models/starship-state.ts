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
}
