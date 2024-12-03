import { Injectable, OnDestroy } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
} from '@angular/fire/firestore';
import { PlayerPresence } from '../../models/player-presence';

/**
 * This service is used to track if a player is online or offline
 */
@Injectable({
  providedIn: 'root',
})
export class PlayerPresenceService implements OnDestroy {
  private heartbeatInterval: any;
  private presenceRef: any;
  private readonly OFFLINE_THRESHOLD = 30000; // 30 seconds

  constructor(private firestore: Firestore) {}

  async initializePresence(playerId: string, gameSessionId: string) {
    // Create presence document reference
    this.presenceRef = doc(this.firestore, `presence/${playerId}`);

    // Set initial presence
    await this.updatePresence(playerId, gameSessionId);

    // Start heartbeat
    this.startHeartbeat(playerId, gameSessionId);

    // Set offline cleanup when window closes
    window.addEventListener('beforeunload', () => {
      this.setOffline();
    });
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
