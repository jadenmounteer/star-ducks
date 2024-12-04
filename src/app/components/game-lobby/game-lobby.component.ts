import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GameSessionService } from '../../services/game-session.service';
import { PresenceService } from '../../services/player-presence/player-presence';
import { PlayerPresence } from '../../models/player-presence';
import { DropdownComponent } from '../ui-components/dropdown/dropdown.component';
import { Role } from '../../models/role';
import { PlayerSessionService } from '../../services/player-session/player-session';

@Component({
  selector: 'app-game-lobby',
  standalone: true,
  imports: [DropdownComponent],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.scss',
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private gameSessionService = inject(GameSessionService);
  private presenceService = inject(PresenceService);
  protected playerSessionService = inject(PlayerSessionService);
  private destroy$ = new Subject<void>();

  protected players = signal<PlayerPresence[]>([]);
  protected gameSessionId: string | null = null;
  protected roles = Object.values(Role);
  protected selectedMission = 'Trouble on Moon Colony';

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

  protected async toggleRole(player: PlayerPresence, role: Role) {
    if (player.playerId !== this.playerSessionService.getPlayerId()) {
      return; // Only allow players to modify their own roles
    }

    const currentRoles = player.roles || [];
    let newRoles: Role[];

    if (currentRoles.includes(role)) {
      newRoles = currentRoles.filter((r) => r !== role);
    } else {
      newRoles = [...currentRoles, role];
    }

    await this.presenceService.updatePlayerRoles(newRoles);
  }

  protected isRoleSelected(player: PlayerPresence, role: Role): boolean {
    return player.roles?.includes(role) || false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
