import { inject, Injectable } from '@angular/core';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { addDoc, collection } from '@angular/fire/firestore';
import { GameSession } from '../models/game-session';

@Injectable({
  providedIn: 'root',
})
export class GameSessionService {
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  public async createNewGameSession(): Promise<string> {
    // create a new game session
    const gameSession: GameSession = {
      playerIds: [],
      entranceCode: '',
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    const collectionRef = collection(this.firestore, 'game-sessions');

    const result = await addDoc(collectionRef, gameSession);

    console.log('Document reference', result);
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

  public async getGameSession(gameSessionId: string): Promise<GameSession> {
    const gameSessionRef = doc(
      this.firestore,
      `game-sessions/${gameSessionId}`
    );
    const gameSessionSnapshot = await getDoc(gameSessionRef);
    return gameSessionSnapshot.data() as GameSession;
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
}
