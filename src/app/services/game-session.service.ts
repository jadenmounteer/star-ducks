import { inject, Injectable } from '@angular/core';
import {
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { addDoc, collection } from '@angular/fire/firestore';
import { GameSession } from '../models/game-session';
import { Observable } from 'rxjs';
import { StarshipState } from '../models/starship-state';
import { map } from 'rxjs/operators';
import { ShipSystemsService } from './ship-systems/ship-systems.service';

@Injectable({
  providedIn: 'root',
})
export class GameSessionService {
  private firestore: Firestore = inject(Firestore);
  private shipSystemsService = inject(ShipSystemsService);

  constructor() {}

  public getStarshipState(gameSessionId: string): Observable<StarshipState> {
    const docRef = doc(this.firestore, `game-sessions/${gameSessionId}`);
    return docData(docRef).pipe(map((session: any) => session?.starshipState));
  }

  public async updateStarshipState(
    gameSessionId: string,
    starshipState: StarshipState
  ): Promise<void> {
    const gameSessionRef = doc(
      this.firestore,
      `game-sessions/${gameSessionId}`
    );
    await updateDoc(gameSessionRef, { starshipState });
  }

  public async createNewGameSession(): Promise<string> {
    const gameSession: GameSession = {
      playerIds: [],
      entranceCode: '',
      createdAt: Date.now(),
      lastActive: Date.now(),
      starshipState: {
        currentLocation: { x: 100, y: 100 }, // Earth's coordinates
        isMoving: false,
        speed: 1,
        systems: this.shipSystemsService.initializeSystems(),
      },
    };
    const collectionRef = collection(this.firestore, 'game-sessions');
    const result = await addDoc(collectionRef, gameSession);
    return result.id;
  }

  public async updateGameSession(
    gameSessionId: string,
    gameSession: GameSession
  ): Promise<void> {
    const gameSessionRef = doc(
      this.firestore,
      `game-sessions/${gameSessionId}`
    );
    await setDoc(gameSessionRef, gameSession);
  }

  public async getGameSession(
    entranceCode: string
  ): Promise<GameSession | null> {
    // Get reference to the collection
    const gamesCollection = collection(this.firestore, 'game-sessions');

    // Query for the document where entranceCode matches
    const q = query(gamesCollection, where('entranceCode', '==', entranceCode));
    const querySnapshot = await getDocs(q);

    // Return the first matching document or null if none found
    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as GameSession;
  }

  public generateEntranceCode(): string {
    let code = '';

    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      code += alphabet[randomIndex];
    }

    // Add a random 3 digit number to the code
    code += Math.floor(Math.random() * 3000);

    return code;
  }

  public getGameSessionById(
    gameSessionId: string
  ): Observable<GameSession | null> {
    const docRef = doc(this.firestore, `game-sessions/${gameSessionId}`);
    return docData(docRef) as Observable<GameSession>;
  }
}
