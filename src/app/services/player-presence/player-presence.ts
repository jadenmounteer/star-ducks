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
  private firestore: Firestore = inject(Firestore);

  private heartbeatInterval: any;
  private presenceRef: any;
  private readonly OFFLINE_THRESHOLD = 30000; // 30 seconds
  private currentGameSessionId: string | null = null;

  private playerSessionService: PlayerSessionService =
    inject(PlayerSessionService);

  constructor() {
    // Add visibility change listener
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.currentGameSessionId) {
        // Reinitialize presence when returning to the app
        this.initializePresence(this.currentGameSessionId);
      } else if (document.visibilityState === 'hidden') {
        // Clean up when leaving the app
        this.setOffline();
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }
      }
    });
  }

  async initializePresence(gameSessionId: string) {
    const playerId = this.playerSessionService.getPlayerId();
    this.currentGameSessionId = gameSessionId;

    // Clear any existing heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

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

  // TODO call this when the player leaves the game session
  public async leaveGame() {
    await this.setOffline();
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.currentGameSessionId = null;
  }
}
