import { Injectable, signal } from '@angular/core';
import { ShipSystem, ShipSystemName } from '../../models/ship-system';
import { TerminalName } from '../../components/terminals/terminal/terminal.component';

@Injectable({
  providedIn: 'root',
})
export class ShipSystemsService {
  private readonly DEFAULT_SYSTEMS: ShipSystem[] = [
    {
      name: ShipSystemName.Engines,
      status: 'Online',
      powerUsage: 0,
      terminal: TerminalName.FlightControl,
    },
    {
      name: ShipSystemName.LifeSupport,
      status: 'Online',
      powerUsage: 10,
      terminal: TerminalName.Operations,
    },
    {
      name: ShipSystemName.Weapons,
      status: 'Online',
      powerUsage: 0,
      terminal: TerminalName.Tactical,
    },
    {
      name: ShipSystemName.Shields,
      status: 'Online',
      powerUsage: 0,
      terminal: TerminalName.Tactical,
    },
  ];

  private systems = signal<ShipSystem[]>([]);

  // Public accessors
  public get currentSystems(): ShipSystem[] {
    return this.systems();
  }

  public initializeSystems(): ShipSystem[] {
    this.systems.set(this.DEFAULT_SYSTEMS);
    return this.currentSystems;
  }

  public updateSystem(
    systemName: ShipSystemName,
    updates: Partial<ShipSystem>
  ): boolean {
    const currentSystems = this.systems();
    const systemIndex = currentSystems.findIndex((s) => s.name === systemName);

    if (systemIndex === -1) return false;

    const updatedSystems = [...currentSystems];
    updatedSystems[systemIndex] = {
      ...updatedSystems[systemIndex],
      ...updates,
    };

    this.systems.set(updatedSystems);
    return true;
  }

  public getSystemByName(name: ShipSystemName): ShipSystem | undefined {
    return this.systems().find((s) => s.name === name);
  }
}
