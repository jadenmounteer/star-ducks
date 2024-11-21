import { Component, inject, NgZone } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { Auth } from '@angular/fire/auth';
import { DropdownComponent } from './components/ui-components/dropdown/dropdown.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DropdownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'star-ducks';
  protected appInitializing: boolean = true;
  protected readonly authService: AuthService = inject(AuthService);
  private readonly auth: Auth = inject(Auth);
  private readonly ngZone: NgZone = inject(NgZone);
  private readonly router: Router = inject(Router);

  constructor() {
    this.auth.onAuthStateChanged((user) => {
      this.authService.activeUser = user;
      this.authService.isLoggedIn = !!user;
      this.appInitializing = false;
      if (this.authService.isLoggedIn) {
        // Not sure why I need ngZone in this situation, but it's necessary so the home page doesn't appear on top of the game.
        // Something to do with navigating to a new route. Probably because it's called in a callback.
        this.ngZone.run(() => {
          this.router.navigateByUrl('home');
        });
      }
    });
  }
}
