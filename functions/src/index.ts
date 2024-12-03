/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from 'firebase-functions/logger';
const { onSchedule } = require('firebase-functions/v2/scheduler');
import * as admin from 'firebase-admin';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * This method is scheduled to run every day at midnight.
 * It cleans up inactive game sessions.
 * It only runs in prod. I can make it run in dev if I deploy to the dev environment.
 * For now, I just delete the sessions manually in dev.
 */
export const cleanupInactiveSessions = onSchedule(
  'every day 00:00',
  async () => {
    const firestore = admin.firestore();
    const playerPresenceSnapshot = await firestore
      .collection('player-presence')
      .get();

    // Get all active players
    const activePlayers = new Set(
      playerPresenceSnapshot.docs
        .filter((doc) => {
          const data = doc.data();
          return Date.now() - data.lastSeen < 30000; // 30 seconds threshold
        })
        .map((doc) => doc.data().playerId)
    );

    // Get and cleanup inactive sessions
    const sessionsSnapshot = await firestore.collection('game-sessions').get();
    const batch = firestore.batch();

    sessionsSnapshot.docs.forEach((doc) => {
      const session = doc.data();
      const hasActivePlayers = session.playerIds.some((id: string) =>
        activePlayers.has(id)
      );

      if (!hasActivePlayers) {
        batch.delete(doc.ref);
      }
    });

    await batch.commit();

    logger.log('Inactive game sessions cleaned up.');
  }
);
