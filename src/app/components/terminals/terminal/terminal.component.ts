import { Component } from '@angular/core';
import {
  ScreenSwiperComponent,
  Terminal,
} from '../../screen-swiper/screen-swiper.component';
import { MainViewerComponent } from '../main-viewer/main-viewer.component';
import { FlightControlComponent } from '../flight-control/flight-control/flight-control.component';
import { OperationsComponent } from '../operations/operations.component';

export enum TerminalName {
  MainViewer = 'Main Viewer',
  FlightControl = 'Flight Control',
  Operations = 'Operations',
  Tactical = 'Tactical',
  Engineering = 'Engineering',
  Communications = 'Communications',
  Captain = 'Captain',
}

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
    { name: TerminalName.MainViewer, component: MainViewerComponent },
    { name: TerminalName.FlightControl, component: FlightControlComponent },
    { name: TerminalName.Operations, component: OperationsComponent },
  ];

  currentTerminalIndex = 0;

  onTerminalChange(index: number) {
    this.currentTerminalIndex = index;
  }
}
