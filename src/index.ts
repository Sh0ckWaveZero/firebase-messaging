import { env } from 'bun';
import * as serviceAccount from "../config/serviceAccountKey.json";
import { Elysia } from "elysia";
import admin from "firebase-admin";
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import { CoSignOrderData, IpdInfo, NotificationData, NotificationType, OpdInfo, PatientInfo } from './types';

class FirebaseService {
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

class MessageService {
  constructor(private firebaseService: FirebaseService) { }

  public createMessage(): Message {
    const fvmToken = env.FCM_TOKEN ?? '';
    const opdPatient: PatientInfo = {};
    const ipdPatient: PatientInfo = {};
    const opdInfo: OpdInfo = { patient: opdPatient };
    const ipdInfo: IpdInfo = { patient: ipdPatient };
    const consignInfo: CoSignOrderData = {};
    const notificationType: NotificationType = 'opd';
    const notificationData: NotificationData = {
      opdInfo: opdInfo || {},
      ipdInfo: ipdInfo || {},
      consign: consignInfo || {},
      lab: {}
    }

    return {
      token: fvmToken,
      notification: {
        title: "NEW OPD",
        body: "นายมานะ มานะมา",
      },
      data: {
        id: '1',
        title: 'Notification Title',
        type: notificationType,
        name: 'Notification Name',
        time: 'Notification Time',
        icon: 'Notification Icon',
        data: JSON.stringify(notificationData)
      }
    };
  }

  public async handlePushMessage() {
    const message = this.createMessage();
    return this.firebaseService.sendMessage(message);
  }
}

const startServer = () => {
  const firebaseService = new FirebaseService();
  const messageService = new MessageService(firebaseService);

  const app = new Elysia()
    .get("/", () => "Hello Elysia")
    .post("/pushMessage", () => messageService.handlePushMessage())
    .listen(3000);

  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

startServer();