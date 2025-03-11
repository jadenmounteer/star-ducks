import { Injectable, signal } from '@angular/core';
import { ShipSystem, ShipSystemName } from '../models/ship-system';
import { ShipSystemsService } from './ship-systems/ship-systems.service';

@Injectable({
  providedIn: 'root',
})
export class PowerManagementService {
  private totalPower = signal<number>(100); // Total available power

  constructor(private shipSystemsService: ShipSystemsService) {}

  allocatePower(systemName: ShipSystemName, power: number): void {
    // Get all current systems to calculate total power
    const currentSystems = this.shipSystemsService.currentSystems;

    // Calculate what the total power would be with the new allocation
    const totalAllocated = currentSystems.reduce(
      (sum, sys) => sum + (sys.name === systemName ? power : sys.powerUsage),
      0
    );

    if (totalAllocated <= this.totalPower()) {
      this.shipSystemsService.updateSystem(systemName, { powerUsage: power });
    } else {
      console.error('Not enough power available');
    }
  }

  getAvailablePower(): number {
    return (
      this.totalPower() -
      this.shipSystemsService.currentSystems.reduce(
        (sum, sys) => sum + sys.powerUsage,
        0
      )
    );
  }

  getSystems(): ShipSystem[] {
    return this.shipSystemsService.currentSystems;
  }

  // Optional: Add a method to get total power capacity
  getTotalPower(): number {
    return this.totalPower();
  }
}
