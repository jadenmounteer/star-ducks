import { Component, OnInit } from '@angular/core';
import { PowerManagementService } from '../../../services/power-management.service';
import { ShipSystem } from '../../../models/ship-system';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [],
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.scss',
})
export class OperationsComponent implements OnInit {
  systems: ShipSystem[] = [];
  availablePower: number = 0;

  constructor(private powerManagementService: PowerManagementService) {}

  ngOnInit(): void {
    this.updateData();
  }

  updateData(): void {
    this.systems = this.powerManagementService.getSystems();
    this.availablePower = this.powerManagementService.getAvailablePower();
  }

  allocatePower(systemName: string, power: number): void {
    this.powerManagementService.allocatePower(systemName, power);
    this.updateData();
  }
}
