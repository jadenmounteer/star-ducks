import { Component } from '@angular/core';
import {
  ScreenSwiperComponent,
  Terminal,
} from '../../screen-swiper/screen-swiper.component';
import { MainViewerComponent } from '../main-viewer/main-viewer.component';
import { FlightControlComponent } from '../flight-control/flight-control/flight-control.component';
import { OperationsComponent } from '../operations/operations.component';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [
    ScreenSwiperComponent,
    MainViewerComponent,
    FlightControlComponent,
    OperationsComponent,
  ],
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.scss',
})
export class TerminalComponent {
  terminals: Terminal[] = [
    { name: 'Main Viewer', component: MainViewerComponent },
    { name: 'Flight Control', component: FlightControlComponent },
    { name: 'Operations', component: OperationsComponent },
  ];

  currentTerminalIndex = 0;

  onTerminalChange(index: number) {
    this.currentTerminalIndex = index;
  }
}
