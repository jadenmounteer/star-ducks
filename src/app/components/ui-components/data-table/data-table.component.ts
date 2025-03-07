import { Component, Input } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
  class?: (value: any) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <div class="table-container">
      @if(showHeader) {
      <div class="table-header">
        <ng-content select="[table-header]"></ng-content>
      </div>
      }

      <table>
        <thead>
          <tr>
            @for(column of columns; track column.key) {
            <th>{{ column.label }}</th>
            } @if(showActions) {
            <th>Actions</th>
            }
          </tr>
        </thead>
        <tbody>
          @for(row of data; track trackBy(row)) {
          <tr>
            @for(column of columns; track column.key) {
            <td
              [attr.data-label]="column.label"
              [class]="column.class ? column.class(row[column.key]) : ''"
            >
              {{
                column.format ? column.format(row[column.key]) : row[column.key]
              }}
            </td>
            } @if(showActions) {
            <td data-label="Actions">
              <ng-content
                select="[table-actions]"
                [ngTemplateOutlet]="actionsTemplate"
                [ngTemplateOutletContext]="{ $implicit: row }"
              ></ng-content>
            </td>
            }
          </tr>
          }
        </tbody>
      </table>

      @if(showFooter) {
      <div class="table-footer">
        <ng-content select="[table-footer]"></ng-content>
      </div>
      }
    </div>
  `,
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showHeader = false;
  @Input() showFooter = false;
  @Input() showActions = false;
  @Input() trackBy: (item: any) => any = (item) => item.id;
}
