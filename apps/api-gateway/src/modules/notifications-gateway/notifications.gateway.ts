import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from '../logger/logger.service';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: process.env.FRONTEND_URL },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly users = new Map<string, string>();

  constructor(private readonly logger: LoggerService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;

    if (!userId) {
      this.logger.info('WebSocket connection rejected (missing userId)', {
        socketId: client.id,
      });

      client.disconnect();
      return;
    }

    this.users.set(userId, client.id);

    this.logger.info('WebSocket client connected', {
      userId,
      socketId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.users.entries()) {
      if (socketId === client.id) {
        this.users.delete(userId);

        this.logger.info('WebSocket client disconnected', {
          userId,
          socketId: client.id,
        });

        break;
      }
    }
  }

  emitToUser(userId: string, event: string, payload: any) {
    const socketId = this.users.get(userId);

    if (!socketId) {
      this.logger.info('Attempt to emit to offline user', {
        userId,
        event,
      });
      return;
    }

    this.server.to(socketId).emit(event, payload);
  }
}
