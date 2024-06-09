import { env } from 'bun';
import * as serviceAccount from "../config/serviceAccountKey.json";
import { Elysia } from "elysia";
import admin from "firebase-admin";
import { Message } from 'firebase-admin/lib/messaging/messaging-api';


const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    console.log("🔥 Firebase initialized successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase: ", error);
  }
}

const createMessage = (): Message => {
  // TODO: Replace with your actual FCM token
  const fvmToken = env.FCM_TOKEN ?? '';

  return {
    token: fvmToken,
    notification: {
      "title": "NEW OPD",
      "body": "นายมานะ มานะมา",
    },
    data: {
      id: '1',
      title: 'Notification Title',
      type: 'Notification Type',
      name: 'Notification Name',
      time: 'Notification Time',
      icon: 'Notification Icon',
      isRead: 'false',
    }
  };
}

const sendMessage = async (message: Message) => {
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
};

const handlePushMessage = async () => {
  const message = createMessage();
  return sendMessage(message);
};

const startServer = () => {
  const app = new Elysia()
    .get("/", () => "Hello Elysia")
    .post("/pushMessage", handlePushMessage)
    .listen(3000);

  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

initializeFirebase();
startServer();