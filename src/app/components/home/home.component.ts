import { Component, inject } from '@angular/core';
import { StarDateService } from '../../services/star-date.service';
import { FormsModule } from '@angular/forms';
import { GameSessionService } from '../../services/game-session.service';
import { PresenceService } from '../../services/player-presence/player-presence';

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
  private presenceService: PresenceService = inject(PresenceService);

  protected starDate: string = this.starDateService.getCurrentStarDate();
  protected gameCode = '';

  protected async createNewGame(): Promise<void> {
    const gameSessionId = await this.gameSessionService.createNewGameSession();
    const playerId = await this.presenceService.initializePresence(
      gameSessionId
    );

    // Update game session with the host's player ID
    await this.gameSessionService.updateGameSession(gameSessionId, {
      playerIds: [playerId],
      entranceCode: '1234',
      createdAt: Date.now(),
      lastActive: Date.now(),
    });

    // Navigate to game lobby or wherever needed
  }

  protected async joinGame(gameCode: string): Promise<void> {
    // Verify game exists and is joinable
    const gameSession = await this.gameSessionService.getGameSession(gameCode);
    if (gameSession && gameSession.id) {
      const playerId = await this.presenceService.initializePresence(
        gameSession.id
      );

      // Add player to game session
      const updatedPlayerIds = [...gameSession.playerIds, playerId];
      await this.gameSessionService.updateGameSession(gameSession.id, {
        playerIds: updatedPlayerIds,
        entranceCode: gameSession.entranceCode,
        createdAt: gameSession.createdAt,
        lastActive: Date.now(),
      });

      // Navigate to game lobby or wherever needed
    }
  }
}
