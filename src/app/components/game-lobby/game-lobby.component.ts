import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GameSessionService } from '../../services/game-session.service';
import { PresenceService } from '../../services/player-presence/player-presence';
import { PlayerPresence } from '../../models/player-presence';

@Component({
  selector: 'app-game-lobby',
  standalone: true,
  imports: [],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.scss',
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private gameSessionService = inject(GameSessionService);
  private presenceService = inject(PresenceService);
  private destroy$ = new Subject<void>();

  protected players = signal<PlayerPresence[]>([]);
  protected gameSessionId: string | null = null;

  ngOnInit() {
    // Get the game session ID from the route
    this.gameSessionId = this.route.snapshot.paramMap.get('gameSessionId');

    if (this.gameSessionId) {
      // Subscribe to player presence updates
      this.presenceService
        .getPlayersInSession(this.gameSessionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((players: PlayerPresence[]) => {
          this.players.set(players);
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
