import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection } from '@angular/fire/firestore';
import { GameSession } from '../models/game-session';

@Injectable({
  providedIn: 'root',
})
export class GameSessionService {
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  public async createNewGameSession(): Promise<any> {
    // create a new game session
    const gameSession: GameSession = {};
    const collectionRef = collection(this.firestore, 'game-sessions');

    const result = await addDoc(collectionRef, gameSession);

    return result;
  }
}
