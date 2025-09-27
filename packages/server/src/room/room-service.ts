import bcrypt from 'bcryptjs';

import { SALT_ROUNDS } from './constants.js';

import { ERROR_CODES } from './error-code.js';

import Room from './room-model.js'

import { createServiceResponse, type ServiceResponse } from '../utils/common.js';
import mongoose from 'mongoose';
import User from '../user/user-model.js';
import Message from '../message/message-model.js';

type RoomData = {
  id: string,
  name?: string,
  owner: string,
  created: Date,
  members: string[]
};

export async function getRooms(userId: string): Promise<ServiceResponse<{ roomsData: RoomData[] }>> {

  const rooms = await Room.find({
    $or: [
      { owner: userId },
      { members: { $in: [userId] } }
    ]
  }).lean();

  if (!rooms) {
    const roomsData: RoomData[] = [] as const;
    return createServiceResponse(true, null, { roomsData });
  }

  const roomsData = rooms.map(room => {
    return {
      id: room._id.toString(),
      name: room.name,
      owner: room.owner.toString(),
      created: room.created,
      members: room.members.map(member => member.toString())
    } as const;
  });

  return createServiceResponse(true, null, { roomsData });

}

export async function createRoom(name: string, password: string, owner: string): Promise<ServiceResponse<{ roomData: RoomData }>> {

  const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : null;

  const members: mongoose.Schema.Types.ObjectId[] = [];

  const room = await Room.create({
    name,
    password: passwordHash,
    owner,
    members,
  });

  const roomData: RoomData = {
    id: room._id.toString(),
    name: room.name,
    owner: room.owner.toString(),
    created: room.created,
    members: room.members.map(member => member.toString())
  }

  return createServiceResponse(true, null, { roomData });
}

export async function deleteRoom(roomId: string, userId: string): Promise<ServiceResponse<void>> {

  const room = await Room.findById(roomId);

  if (!room) {
    return createServiceResponse(false, ERROR_CODES.ROOM_NOT_FOUND);
  }

  const user = await User.findById(userId).lean();

  if (!user) {
    createServiceResponse(false, ERROR_CODES.USER_DOES_NOT_EXIST);
  }

  if (room.owner.toString() !== userId) {
    return createServiceResponse(false, ERROR_CODES.INSUFFICIENT_PRIVILEGE);
  }

  await room.deleteOne();

  await Message.deleteMany({ roomId });

  return createServiceResponse(true);

}

export async function joinRoom(roomId: string, password: string, userId: string): Promise<ServiceResponse<{ roomData?: RoomData }>> {

  const user = await User.findById(userId);

  if (!user) {
    return createServiceResponse(false, ERROR_CODES.USER_DOES_NOT_EXIST);
  }

  const room = await Room.findById(roomId);

  if (!room) {
    return createServiceResponse(false, ERROR_CODES.ROOM_NOT_FOUND);
  }

  if (room.owner.toString() === userId || room.members.find(member => member.toString() === userId)) {
    return createServiceResponse(false, ERROR_CODES.ALREADY_IN_ROOM);
  }

  if (room.password) {
    const isValid = await bcrypt.compare(password, room.password);

    if (!isValid) {
      return createServiceResponse(false, ERROR_CODES.INCORRECT_PASSWORD);
    }
  }

  room.members.push(user._id);
  await room.save();

  const roomData: RoomData = {
    id: room._id.toString(),
    name: room.name,
    owner: room.owner.toString(),
    created: room.created,
    members: room.members.map(member => member.toString())
  }

  return createServiceResponse(true, null, { roomData });

}

export async function leaveRoom(roomId: string, userId: string): Promise<ServiceResponse<void>> {

  const room = await Room.findById(roomId);

  if (!room) {
    return createServiceResponse(false, ERROR_CODES.ROOM_NOT_FOUND);
  }

  const user = await User.findById(userId);

  if (!user) {
    return createServiceResponse(false, ERROR_CODES.USER_DOES_NOT_EXIST);
  }

  if (room.owner.toString() === userId) {
    return createServiceResponse(false, ERROR_CODES.CANNOT_LEAVE_ROOM_YOU_OWN)
  }

  const index = room.members.findIndex(member => member.toString() === userId);

  if (index === -1) {
    return createServiceResponse(false, ERROR_CODES.NOT_IN_ROOM);
  }

  room.members.splice(index, 1);

  await room.save();

  await Message.deleteMany({ roomId, userId });

  return createServiceResponse(true);

}

export async function updateRoomName(roomId: string, name: string, userId: string): Promise<ServiceResponse<void>> {

  const room = await Room.findById(roomId);

  if (!room) {
    return createServiceResponse(false, ERROR_CODES.ROOM_NOT_FOUND);
  }

  const user = await User.findById(userId).lean();

  if (!user) {
    return createServiceResponse(false, ERROR_CODES.USER_DOES_NOT_EXIST);
  }

  if (room.owner.toString() !== userId) {
    return createServiceResponse(false, ERROR_CODES.INSUFFICIENT_PRIVILEGE);
  }

  room.name = name;
  await room.save();

  return createServiceResponse(false);

}

export async function updateRoomPassword(roomId: string, password: string, userId: string): Promise<ServiceResponse<void>> {

  const room = await Room.findById(roomId);

  if (!room) {
    return createServiceResponse(false, ERROR_CODES.ROOM_NOT_FOUND);
  }

  const user = await User.findById(userId).lean();

  if (!user) {
    return createServiceResponse(false, ERROR_CODES.USER_DOES_NOT_EXIST);
  }

  if (room.owner.toString() !== userId) {
    return createServiceResponse(false, ERROR_CODES.INSUFFICIENT_PRIVILEGE);
  }

  const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : null;

  room.password = passwordHash;
  await room.save();

  return createServiceResponse(true);

}