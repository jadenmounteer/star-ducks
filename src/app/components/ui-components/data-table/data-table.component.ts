import { Component, Input } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
  class?: (value: any) => string;
  responsive?: {
    gridColumn?: '1' | '2' | '1 / -1';
    justify?: 'flex-start' | 'flex-end' | 'center';
  };
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showHeader = false;
  @Input() showFooter = false;
  @Input() showActions = false;
  @Input() trackBy: (item: any) => any = (item) => item.id;
}
