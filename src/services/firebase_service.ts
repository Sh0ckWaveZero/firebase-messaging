import * as serviceAccount from "../../config/serviceAccountKey.json";
import admin from "firebase-admin";
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

export class FirebaseService {
  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
      });
      console.log("🔥 Firebase initialized successfully.");
    } catch (error) {
      console.error("❌ Failed to initialize Firebase: ", error);
    }
  }

  public async sendMessage(message: Message) {
    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return {
        status: 200,
        message: 'Successfully sent message'
      }
    } catch (error) {
      console.log('Error sending message:', error);
    }
  }
}