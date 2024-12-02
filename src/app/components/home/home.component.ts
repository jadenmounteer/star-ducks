import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { StarDateService } from '../../services/star-date.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected authService: AuthService = inject(AuthService);
  private starDateService: StarDateService = inject(StarDateService);

  protected starDate: string = this.starDateService.getCurrentStarDate();
  protected gameCode = '';

  protected createNewStarship(): void {
    // FIXME show a modal asking for the starship name.
  }
}
