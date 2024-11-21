import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  input,
  InputSignal,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
})
export class DropdownComponent {
  public items: InputSignal<string[]> = input.required();
  @Output() selected = new EventEmitter<string>();
  public isOpen = false;
  public selectedItem: string | null = null;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectItem(item: string) {
    this.selectedItem = item;
    this.isOpen = false;
    this.selected.emit(item);
  }
}
