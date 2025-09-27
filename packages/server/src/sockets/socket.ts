import { Server } from 'socket.io';
import http from 'http';
import type { RequestHandler } from 'express-serve-static-core';
import { type Request } from 'express';

import * as messageService from '../message/message-service.js';

export function setupSocket(server: http.Server, sessionMiddleware: RequestHandler) {

  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true
    }
  });

  io.engine.use(sessionMiddleware);

  io.on('connection', (socket) => {

    const req = socket.request as Request;

    if (!req.session.user) {
      socket.disconnect();
      return;
    }

    const user = req.session.user;

    socket.on('join-room', async (roomId) => {
      await socket.join(roomId);

      const result = await messageService.getMessages(roomId, user.id);

      if (result.ok && result.data && result.data.messagesData) {
        io.to(roomId).emit('load-initial-messages', result.data.messagesData);
      }
    });

    socket.on('leave-room', async (roomId) => {
      await socket.leave(roomId);
    });

    socket.on('send-message', async (data: { roomId: string, content: string }) => {
      const { roomId, content } = data;

      const result = await messageService.createMessage(roomId, user.id, content);

      if (result.ok && result.data && result.data.messageData) {
        io.to(roomId).emit('receive-message', result.data.messageData);
      }

    });
  });

}