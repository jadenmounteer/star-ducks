import { Injectable, signal } from '@angular/core';
import { ShipSystem } from '../models/ship-system';

@Injectable({
  providedIn: 'root',
})
export class PowerManagementService {
  private totalPower = signal<number>(100); // Total available power
  private systems = signal<ShipSystem[]>([
    {
      name: 'Forward Shields',
      status: 'Online',
      powerUsage: 0,
      terminal: 'Tactical',
    },
    {
      name: 'Engines',
      status: 'Online',
      powerUsage: 10,
      terminal: 'Flight Control',
    },
    {
      name: 'Life Support',
      status: 'Online',
      powerUsage: 20,
      terminal: 'Operations',
    },
  ]);

  allocatePower(systemName: string, power: number): void {
    const updatedSystems = this.systems().map((system) => {
      if (system.name === systemName) {
        return { ...system, powerUsage: power };
      }
      return system;
    });

    const totalAllocated = updatedSystems.reduce(
      (sum, sys) => sum + sys.powerUsage,
      0
    );

    if (totalAllocated <= this.totalPower()) {
      this.systems.set(updatedSystems);
    } else {
      console.error('Not enough power available');
    }
  }

  getAvailablePower(): number {
    return (
      this.totalPower() -
      this.systems().reduce((sum, sys) => sum + sys.powerUsage, 0)
    );
  }

  getSystems(): ShipSystem[] {
    return this.systems();
  }
}
