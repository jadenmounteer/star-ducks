import { Component, inject, NgZone } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { UserMenuComponent } from './components/user-menu/user-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UserMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'star-ducks';
  protected appInitializing: boolean = true;

  constructor() {}
}
