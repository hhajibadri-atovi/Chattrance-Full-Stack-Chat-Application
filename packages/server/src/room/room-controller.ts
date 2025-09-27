import type { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';

import { createApiResponse } from '../utils/common.js';

import { ERROR_CODES } from './error-code.js';

import * as roomService from './room-service.js';

import { MAX_ROOM_NAME } from './constants.js';

const BAD_REQUEST = 'BAD REQUEST';
const SERVER_ERROR = 'SERVER ERROR';

export async function getRooms(req: Request, res: Response) {

  try {

    const user = req.session.user;

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(createApiResponse(false, 'Must be logged in'));
    }

    const rooms = await roomService.getRooms(user.id);

    return res
      .status(StatusCodes.OK)
      .json(createApiResponse(true, null, { rooms: rooms.data?.roomsData }));

  } catch (err) {

    console.error(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createApiResponse(false, SERVER_ERROR));

  }

}

export async function createRoom(req: Request, res: Response) {

  try {

    const user = req.session.user;

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(createApiResponse(false, 'Must be logged in'));
    }

    if (typeof req.body.name !== 'string' || typeof req.body.password !== 'string') {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(createApiResponse(false, BAD_REQUEST));
    }

    const name: string = req.body.name.trim();

    if (name.length > MAX_ROOM_NAME) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(createApiResponse(false, `Room name must be no greater than ${MAX_ROOM_NAME} characters`));
    }

    const password: string = req.body.password.trim();

    const result = await roomService.createRoom(name, password, user.id);

    if (!result.ok) {
      throw new Error(result.error ?? 'Unknown error');
    }

    return res
      .status(StatusCodes.OK)
      .json(createApiResponse(true, null, result.data));

  } catch (err) {

    console.error(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createApiResponse(false, SERVER_ERROR));
  }

}

export async function leaveRoom(req: Request, res: Response) {

  try {

    const user = req.session.user;

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(createApiResponse(false, 'Must be logged in'));
    }

    if (typeof req.query['room-id'] !== 'string') {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(createApiResponse(false, BAD_REQUEST));
    }

    const roomId: string = req.query['room-id'];

    const result = await roomService.leaveRoom(roomId, user.id);

    if (!result.ok) {

      if (result.error === ERROR_CODES.ROOM_NOT_FOUND) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(createApiResponse(false, 'Room not found'));
      } else if (result.error === ERROR_CODES.CANNOT_LEAVE_ROOM_YOU_OWN) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(createApiResponse(false, 'Cannot leave room you own'));
      } else if (result.error === ERROR_CODES.NOT_IN_ROOM) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(createApiResponse(false, 'Not in room specified'));
      }

      throw new Error(result.error ?? 'Unknown error');

    }

    return res
      .status(StatusCodes.OK)
      .json(createApiResponse(true));

  } catch (err) {

    console.error(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createApiResponse(false, SERVER_ERROR));

  }

}

export async function deleteRoom(req: Request, res: Response) {

  try {

    const user = req.session.user;

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(createApiResponse(false, 'Must be logged in'));
    }

    if (typeof req.query['room-id'] !== 'string') {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(createApiResponse(false, BAD_REQUEST));
    }

    const roomId: string = req.query['room-id'];

    const result = await roomService.deleteRoom(roomId, user.id);

    if (!result.ok) {

      if (result.error === ERROR_CODES.ROOM_NOT_FOUND) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(createApiResponse(false, 'Room not found'));
      } else if (result.error === ERROR_CODES.INSUFFICIENT_PRIVILEGE) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(createApiResponse(false, 'Insufficient privilege'));
      }

      throw new Error(result.error ?? 'Unknown error');

    }

    return res
      .status(StatusCodes.OK)
      .json(createApiResponse(true));


  } catch (err) {

    console.error(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createApiResponse(false, SERVER_ERROR));
  }
}

export async function joinRoom(req: Request, res: Response) {

  try {

    const user = req.session.user;

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(createApiResponse(false, 'Must be logged in'));
    }

    if (
      typeof req.query['room-id'] !== "string" ||
      typeof req.body.password !== 'string'
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(createApiResponse(false, BAD_REQUEST));
    }

    const roomId: string = req.query['room-id'];
    const password: string = req.body.password.trim();

    console.log(roomId, password);

    const result = await roomService.joinRoom(roomId, password, user.id);

    if (!result.ok) {

      if (result.error === ERROR_CODES.ROOM_NOT_FOUND) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(createApiResponse(false, 'Room not found'));
      } else if (result.error === ERROR_CODES.INCORRECT_PASSWORD) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(createApiResponse(false, 'Incorrect password'));
      } else if (result.error === ERROR_CODES.ALREADY_IN_ROOM) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(createApiResponse(false, 'Already in room specified'));
      }

      throw new Error(result.error ?? "Unknown error");

    }

    return res
      .status(StatusCodes.OK)
      .json(createApiResponse(true));

  } catch (err) {

    console.error(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createApiResponse(false, SERVER_ERROR));
  }

}

