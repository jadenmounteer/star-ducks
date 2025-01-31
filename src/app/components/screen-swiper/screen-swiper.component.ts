import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Terminal {
  name: string;
  component: any;
}

@Component({
  selector: 'app-screen-swiper',
  standalone: true,
  imports: [],
  templateUrl: './screen-swiper.component.html',
  styleUrl: './screen-swiper.component.scss',
})
export class ScreenSwiperComponent {
  @Input() terminals: Terminal[] = [];
  @Input() currentIndex = 0;
  @Output() terminalChange = new EventEmitter<number>();

  onNext() {
    if (this.currentIndex < this.terminals.length - 1) {
      this.terminalChange.emit(this.currentIndex + 1);
    }
  }

  onPrevious() {
    if (this.currentIndex > 0) {
      this.terminalChange.emit(this.currentIndex - 1);
    }
  }
}
