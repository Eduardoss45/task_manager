import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly users = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;

    if (!userId) {
      client.disconnect();
      return;
    }

    this.users.set(userId, client.id);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.users.entries()) {
      if (socketId === client.id) {
        this.users.delete(userId);
        break;
      }
    }
  }

  emitToUser(userId: string, event: string, payload: any) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
