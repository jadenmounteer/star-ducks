import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
} from '@angular/fire/firestore';
import { PlayerPresence } from '../../models/player-presence';
import { PlayerSessionService } from '../player-session/player-session';
import { Observable } from 'rxjs';

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
  private playerName: string | null = null;

  private playerSessionService: PlayerSessionService =
    inject(PlayerSessionService);

  constructor() {
    // Add visibility change listener
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.currentGameSessionId) {
        if (this.playerName) {
          // Reinitialize presence when returning to the app
          this.initializePresence(this.currentGameSessionId, this.playerName);
        } else {
          throw new Error('Player name is required to initialize presence');
        }
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

  public getPlayersInSession(
    gameSessionId: string
  ): Observable<PlayerPresence[]> {
    return new Observable<PlayerPresence[]>((observer) => {
      const presenceRef = collection(this.firestore, 'player-presence');
      const q = query(presenceRef, where('gameSessionId', '==', gameSessionId));

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const players = snapshot.docs.map(
            (doc) => doc.data() as PlayerPresence
          );
          observer.next(players);
        },
        (error) => {
          observer.error(error);
        }
      );

      // Clean up listener when unsubscribed
      return () => unsubscribe();
    });
  }

  public async initializePresence(gameSessionId: string, playerName: string) {
    this.playerName = playerName;
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
    await this.updatePresence(playerId, gameSessionId, playerName);

    // Start heartbeat
    this.startHeartbeat(playerId, gameSessionId);

    // Set offline cleanup when window closes
    window.addEventListener('beforeunload', () => {
      this.setOffline();
    });

    return playerId;
  }

  private async updatePresence(
    playerId: string,
    gameSessionId: string,
    playerName: string
  ) {
    const presence: PlayerPresence = {
      playerId,
      playerName,
      gameSessionId,
      lastSeen: Date.now(),
      isOnline: true,
    };

    await setDoc(this.presenceRef, presence);
  }

  private startHeartbeat(playerId: string, gameSessionId: string) {
    // Update presence every 20 seconds
    this.heartbeatInterval = setInterval(() => {
      this.updatePresence(playerId, gameSessionId, this.playerName ?? '');
    }, 20000);
  }

  private async setOffline() {
    if (this.presenceRef) {
      const presence: Partial<PlayerPresence> = {
        isOnline: false,
        lastSeen: Date.now(),
      };
      await setDoc(this.presenceRef, presence, { merge: true });
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
