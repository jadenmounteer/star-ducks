import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
})
export class DropdownComponent {
  @Output() selected = new EventEmitter<string>();
  public isOpen = false;
  public selectedItem: string | null = null;

  public ngOnInit(): void {
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  public ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.dropdown'); // Adjust the selector as necessary

    if (dropdown && !dropdown.contains(target)) {
      this.isOpen = false;
    }
  }

  public toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  public selectItem(item: string): void {
    this.selectedItem = item;
    this.isOpen = false;
    this.selected.emit(item);
  }
}
