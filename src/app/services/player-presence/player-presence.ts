import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { PlayerPresence } from '../../models/player-presence';
import { PlayerSessionService } from '../player-session/player-session';

/**
 * This service is used to track the player's presence in the game session.
 */
@Injectable({
  providedIn: 'root',
})
export class PresenceService implements OnDestroy {
  private heartbeatInterval: any;
  private presenceRef: any;
  private readonly OFFLINE_THRESHOLD = 30000; // 30 seconds

  private playerSessionService: PlayerSessionService =
    inject(PlayerSessionService);
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  async initializePresence(gameSessionId: string) {
    const playerId = this.playerSessionService.getPlayerId();

    // Create presence document reference
    this.presenceRef = doc(this.firestore, `player-presence/${playerId}`);

    // Set initial presence
    await this.updatePresence(playerId, gameSessionId);

    // Start heartbeat
    this.startHeartbeat(playerId, gameSessionId);

    // Set offline cleanup when window closes
    window.addEventListener('beforeunload', () => {
      this.setOffline();
    });

    return playerId;
  }

  private async updatePresence(playerId: string, gameSessionId: string) {
    const presence: PlayerPresence = {
      playerId,
      gameSessionId,
      lastSeen: Date.now(),
      isOnline: true,
    };

    await setDoc(this.presenceRef, presence);
  }

  private startHeartbeat(playerId: string, gameSessionId: string) {
    // Update presence every 20 seconds
    this.heartbeatInterval = setInterval(() => {
      this.updatePresence(playerId, gameSessionId);
    }, 20000);
  }

  private async setOffline() {
    if (this.presenceRef) {
      await deleteDoc(this.presenceRef);
    }
  }

  ngOnDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.setOffline();
  }
}
