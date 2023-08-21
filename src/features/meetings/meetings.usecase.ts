import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../core/entities';
import { MeetingsService } from './meetings.service';
import { Meeting } from 'src/core/entities/meeting.entity';
import bcrypt from 'bcryptjs';
import { Participant } from 'src/core/entities/participant.entity';

@Injectable()
export class MeetingsUseCases {
  constructor(private meetingServices: MeetingsService) {}

  async getRoomByCode(roomCode: number): Promise<Meeting> {
    try {
      const roomInfo = await this.meetingServices.findOne({
        code: roomCode,
      });

      return roomInfo;
    } catch (error) {
      throw error;
    }
  }

  async createRoom(meeting: Meeting): Promise<Meeting> {
    try {
      const createdRoom = await this.meetingServices.create(meeting);

      return createdRoom;
    } catch (error) {
      throw error;
    }
  }

  async updateRoom(userId: number, meeting: Meeting): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(meeting.code);

      if (!existsRoom) return;

      const indexHost = existsRoom.users.findIndex((user) => user.id == userId);

      if (indexHost < 0) return;

      existsRoom.title = meeting.title;
      existsRoom.password = meeting.password;

      const updatedRoom = await this.meetingServices.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  async joinRoom(meeting: Meeting, participant: Participant): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(meeting.code);

      if (!existsRoom) throw new NotFoundException();

      const isMatchPassword = await bcrypt.compare(
        meeting.password,
        existsRoom.password,
      );

      if (!isMatchPassword)
        throw new BadRequestException('Wrong password!');

      existsRoom.users.push(participant);

      const updatedRoom = await this.meetingServices.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  async leaveRoom(code: number, participantId: number): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(code);

      if (!existsRoom) return;

      existsRoom.users = existsRoom.users.filter(
        (participant) => participant.id != participantId,
      );

      const updatedRoom = await this.meetingServices.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }
}
