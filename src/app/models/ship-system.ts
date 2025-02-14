export interface ShipSystem {
  name: string;
  status: 'Online' | 'Offline';
  powerUsage: number; // Percentage of total power
  terminal: string;
}
