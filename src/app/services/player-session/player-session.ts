import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package: npm install uuid

/**
 * This service is used to generate a unique player ID for each session.
 * It is used to track the player's presence in the game session.
 */
@Injectable({
  providedIn: 'root',
})
export class PlayerSessionService {
  private readonly PLAYER_ID_KEY = 'player_session_id';

  constructor() {}

  public getPlayerId(): string {
    let playerId = localStorage.getItem(this.PLAYER_ID_KEY);

    if (!playerId) {
      playerId = uuidv4();
      localStorage.setItem(this.PLAYER_ID_KEY, playerId);
    }

    return playerId;
  }
}
