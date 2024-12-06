import { Component } from '@angular/core';
import { SpaceObject } from '../../../../models/space-object';
import { CoursePlotterMapComponent } from '../course-plotter-map/course-plotter-map.component';

@Component({
  selector: 'app-flight-control',
  standalone: true,
  imports: [CoursePlotterMapComponent],
  templateUrl: './flight-control.component.html',
  styleUrl: './flight-control.component.scss',
})
export class FlightControlComponent {
  protected spaceObjects: SpaceObject[] = [
    {
      id: '1',
      name: 'Earth',
      type: 'planet',
      coordinates: { x: 100, y: 100 },
      sprite: 'assets/sprites/space-objects/earth.png',
      animationFrames: 2,
      description: 'Home planet of humanity',
    },
    // Add more space objects...
  ];

  protected onDestinationSelected(destination: SpaceObject): void {
    console.log('New destination selected:', destination);
    // Handle destination selection
  }
}
