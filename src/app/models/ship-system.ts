import { TerminalName } from '../components/terminals/terminal/terminal.component';

export interface ShipSystem {
  name: ShipSystemName;
  status: 'Online' | 'Offline';
  powerUsage: number; // Percentage of total power it is currently using
  terminal: TerminalName;
}

export enum ShipSystemName {
  Engines = 'Engines',
  LifeSupport = 'Life Support',
  Weapons = 'Weapons',
  Shields = 'Shields',
}
