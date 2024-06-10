import { Elysia } from "elysia";
import { FirebaseService, MessageService } from './services';

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