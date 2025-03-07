import { Component, OnInit } from '@angular/core';
import { PowerManagementService } from '../../../services/power-management.service';
import { ShipSystem } from '../../../models/ship-system';
import {
  DataTableComponent,
  TableColumn,
} from '../../ui-components/data-table/data-table.component';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.scss',
})
export class OperationsComponent implements OnInit {
  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'status',
      label: 'Status',
      class: (value) => (value === 'Online' ? 'online' : ''),
    },
    {
      key: 'powerUsage',
      label: 'Energy Level',
      format: (value) => `${value}%`,
    },
    { key: 'terminal', label: 'Terminal' },
  ];

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
