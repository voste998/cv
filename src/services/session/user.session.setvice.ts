import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Session } from "../../entities/session.entity";

@Injectable()
export class UserSessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  public async addSocketToSession(userId: number, socketId: string, targetUserId: number): Promise<void> {
    const existingSession = await this.sessionRepository.findOne({
      where: { userId, targetUserId, socketId },
    });

  
    if (!existingSession) {
      const session = new Session();
      session.userId = userId;
      session.socketId = socketId;
      session.targetUserId = targetUserId;
      await this.sessionRepository.save(session);
    }
  }

 
  public async removeSocketFromSession(userId: number, socketId: string, targetUserId: number): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { userId, socketId, targetUserId },
    });
    if (session) {
      await this.sessionRepository.remove(session);
    }
  }

  
  public async getTargetSockets(senderId: number, receiverId: number): Promise<string[]> {
    const sessions = await this.sessionRepository.find({
      where:{
        userId:In([senderId,receiverId]),
        targetUserId:In([senderId,receiverId])
      }
    });
    
    return sessions.map(session => session.socketId);
  }

  
  public async removeUserSession(userId: number, targetUserId: number): Promise<void> {
    const sessions = await this.sessionRepository.find({
      where: { userId, targetUserId },
    });
    if (sessions.length === 0) {

      await this.sessionRepository.delete({ userId, targetUserId });
    }
  }
}