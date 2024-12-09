import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { GameSessionService } from '../../services/game-session.service';
import { PresenceService } from '../../services/player-presence/player-presence';
import { PlayerPresence } from '../../models/player-presence';
import { DropdownComponent } from '../ui-components/dropdown/dropdown.component';
import { Role } from '../../models/role';
import { PlayerSessionService } from '../../services/player-session/player-session';
import { MissionRegistryService } from '../../services/mission-registry.service';
import { Mission } from '../../missions/mission';

@Component({
  selector: 'app-game-lobby',
  standalone: true,
  imports: [DropdownComponent],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.scss',
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected gameSessionService = inject(GameSessionService);
  private presenceService = inject(PresenceService);
  protected playerSessionService = inject(PlayerSessionService);
  private missionRegistry = inject(MissionRegistryService);

  private destroy$ = new Subject<void>();

  protected availableMissions = this.missionRegistry.getAllMissions();
  protected players = signal<PlayerPresence[]>([]);
  protected gameSessionId: string | null = null;
  protected roles = Object.values(Role);
  protected selectedMission = signal<Mission>(this.availableMissions[0]);

  protected entranceCode = signal<string | null>(null);

  public async ngOnInit() {
    // Get the game session ID from the route
    this.gameSessionId = this.route.snapshot.paramMap.get('gameSessionId');

    if (this.gameSessionId) {
      // Get the game session to display the entrance code
      const gameSession = await firstValueFrom(
        this.gameSessionService.getGameSessionById(this.gameSessionId)
      );
      if (gameSession) {
        this.entranceCode.set(gameSession.entranceCode);
      }

      // Subscribe to player presence updates
      this.presenceService
        .getPlayersInSession(this.gameSessionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((players: PlayerPresence[]) => {
          this.players.set(players);
        });
    }
  }

  // Computed property for available roles based on selected mission
  protected get availableRoles(): Role[] {
    return this.selectedMission()?.availableRoles || [];
  }

  protected selectMission(mission: Mission) {
    this.selectedMission.set(mission);
    // Clear invalid roles from players
    this.players().forEach((player) => {
      if (player.playerId === this.playerSessionService.getPlayerId()) {
        const validRoles = player.roles.filter((role) =>
          mission.availableRoles.includes(role)
        );
        if (validRoles.length !== player.roles.length) {
          this.presenceService.updatePlayerRoles(validRoles);
        }
      }
    });
  }

  protected canLaunchMission(): boolean {
    const mission = this.selectedMission();
    const playerCount = this.players().length;
    const selectedRoles = this.players().flatMap((player) => player.roles);

    return (
      // Check player count requirements
      playerCount >= mission.minimumPlayers &&
      playerCount <= mission.maximumPlayers &&
      // Check that every player has selected a role
      this.players().every((player) => player.roles.length > 0) &&
      // Check that all required roles are filled
      mission.availableRoles.every((role) => selectedRoles.includes(role))
    );
  }

  protected async launchMission() {
    if (!this.gameSessionId || !this.canLaunchMission()) return;

    const mission = this.selectedMission();
    mission.initializeMission();

    await this.gameSessionService.updateGameSession(this.gameSessionId, {
      playerIds: this.players().map((p) => p.playerId),
      entranceCode: this.entranceCode() || '',
      createdAt: Date.now(),
      lastActive: Date.now(),
      missionId: mission.id,
      missionState: mission.getMissionState(),
    });

    this.router.navigate(['/mission', this.gameSessionId]);
  }

  protected isRoleTakenByOtherPlayer(
    role: Role,
    currentPlayer: PlayerPresence
  ): boolean {
    return this.players().some(
      (player) =>
        player.playerId !== currentPlayer.playerId &&
        player.roles?.includes(role)
    );
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

  protected isRoleFilled(role: Role): boolean {
    return this.players().some((player) => player.roles.includes(role));
  }
}
