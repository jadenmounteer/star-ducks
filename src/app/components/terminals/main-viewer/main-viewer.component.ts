import { Component } from '@angular/core';
import { FlightControlComponent } from '../flight-control/flight-control/flight-control.component';

@Component({
  selector: 'app-main-viewer',
  standalone: true,
  imports: [FlightControlComponent],
  templateUrl: './main-viewer.component.html',
  styleUrl: './main-viewer.component.scss',
})
export class MainViewerComponent {}
