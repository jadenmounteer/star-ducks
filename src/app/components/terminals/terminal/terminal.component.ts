import { Component } from '@angular/core';
import { ScreenSwiperComponent } from '../../screen-swiper/screen-swiper.component';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [ScreenSwiperComponent],
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.scss',
})
export class TerminalComponent {}
