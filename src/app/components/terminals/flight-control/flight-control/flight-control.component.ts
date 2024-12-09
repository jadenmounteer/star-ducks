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
  protected isMapVisible = false;
  protected spaceObjects: SpaceObject[] = [
    {
      id: '1',
      name: 'Earth',
      type: 'planet',
      coordinates: { x: 100, y: 100 },
      sprite: 'assets/sprites/space-objects/earth.png',
      animationFrames: 2,
      size: 48,
      description: 'Home planet of Earth ducks.',
    },
    {
      id: '2',
      name: 'Dulcan',
      type: 'planet',
      coordinates: { x: 200, y: 300 },
      sprite: 'assets/sprites/space-objects/dulcan.png',
      animationFrames: 2,
      size: 96,
      description:
        'Home planet of the Dulcans. A peaceful species with no comprehension of what a dad joke is.',
    },
    {
      id: '2',
      name: 'Helios',
      type: 'star',
      coordinates: { x: 400, y: 300 },
      sprite: 'assets/sprites/space-objects/helios.png',
      animationFrames: 2,
      size: 192, // Bigger size for the star
      description: "Earth's star.",
    },
    // Add more space objects...
  ];

  protected showMap(): void {
    this.isMapVisible = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when map is open
  }
  protected onDestinationSelected(destination: SpaceObject): void {
    console.log('New destination selected:', destination);
  }

  protected hideMap(): void {
    this.isMapVisible = false;
    document.body.style.overflow = ''; // Restore scrolling
  }
}
