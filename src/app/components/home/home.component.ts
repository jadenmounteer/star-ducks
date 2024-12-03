import { Component, inject } from '@angular/core';
import { StarDateService } from '../../services/star-date.service';
import { FormsModule } from '@angular/forms';
import { GameSessionService } from '../../services/game-session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private starDateService: StarDateService = inject(StarDateService);
  private gameSessionService: GameSessionService = inject(GameSessionService);

  protected starDate: string = this.starDateService.getCurrentStarDate();
  protected gameCode = '';

  protected createNewGame(): void {
    // This takes the user to the mission lobby page. That page has the game code and a section to choose a mission.

    // TODO We will need to initialize the player presence when the user joins the game.
    // constructor(private presenceService: PresenceService) {}

    // async joinGame(gameSessionId: string, playerId: string) {
    //   await this.presenceService.initializePresence(playerId, gameSessionId);
    //   // ... rest of your join game logic
    // }

    this.gameSessionService.createNewGameSession();
  }
}
