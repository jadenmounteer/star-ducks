import { Component, inject } from '@angular/core';
import { StarDateService } from '../../services/star-date.service';
import { FormsModule } from '@angular/forms';
import { GameSessionService } from '../../services/game-session.service';
import { PresenceService } from '../../services/player-presence/player-presence';
import { ModalService } from '../../services/modal-service/modal-service';
import {
  PlayerNameModalComponent,
  PlayerNameModalResult,
} from '../modals/player-name-modal/player-name-modal.component';
import { Router } from '@angular/router';
import {
  entranceCodeModalComponent,
  entranceCodeModalResult,
} from '../modals/game-code-modal/game-code-modal.component';
import { AlertModalComponent } from '../modals/alert-modal/alert-modal.component';

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
  private modalService: ModalService = inject(ModalService);
  private router: Router = inject(Router);
  protected starDate: string = this.starDateService.getCurrentStarDate();

  protected async createNewGame(): Promise<void> {
    const gameSessionId = await this.gameSessionService.createNewGameSession();

    // Open a modal to get the player's name
    const result = await this.modalService.open<
      PlayerNameModalComponent,
      PlayerNameModalResult
    >(PlayerNameModalComponent);

    if (result && result.playerName) {
      const playerId = await this.presenceService.initializePresence(
        gameSessionId,
        result.playerName
      );

      // Update game session with the host's player ID
      await this.gameSessionService.updateGameSession(gameSessionId, {
        id: gameSessionId,
        playerIds: [playerId],
        entranceCode: this.gameSessionService.generateEntranceCode(),
        createdAt: Date.now(),
        lastActive: Date.now(),
      });

      // TODO Navigate to game lobby or wherever needed
      this.router.navigate(['/game-lobby', gameSessionId]);
    }
  }

  protected async joinGame(): Promise<void> {
    const entranceCodeResult = await this.modalService.open<
      entranceCodeModalComponent,
      entranceCodeModalResult
    >(entranceCodeModalComponent);

    if (entranceCodeResult && entranceCodeResult.entranceCode) {
      // Verify game exists and is joinable
      const gameSession = await this.gameSessionService.getGameSession(
        entranceCodeResult.entranceCode
      );
      if (gameSession && gameSession.id) {
        // Open a modal to get the player's name
        const playerNameResult = await this.modalService.open<
          PlayerNameModalComponent,
          PlayerNameModalResult
        >(PlayerNameModalComponent);

        if (playerNameResult && playerNameResult.playerName) {
          const playerId = await this.presenceService.initializePresence(
            gameSession.id,
            playerNameResult.playerName
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
          this.router.navigate(['/game-lobby', gameSession.id]);
        }
      } else {
        this.modalService.open(AlertModalComponent, {
          message: 'Game not found',
        });
      }
    }
  }
}
