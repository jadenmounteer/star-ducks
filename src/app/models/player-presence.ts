import { Role } from './role';

/**
 * This interface is used to track if a player is online or offline
 * NOTE: YOU WILL NEED TO UPDATE FIRESTORE RULES IF YOU CHANGE THIS
 */
export interface PlayerPresence {
  playerId: string;
  playerName: string;
  gameSessionId: string;
  lastSeen: number;
  isOnline: boolean;
  roles: Role[];
}
