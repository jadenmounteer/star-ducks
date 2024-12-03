/**
 * This interface is used to track if a player is online or offline
 */
export interface PlayerPresence {
  playerId: string;
  gameSessionId: string;
  lastSeen: number;
  isOnline: boolean;
}
