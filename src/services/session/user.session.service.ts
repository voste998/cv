import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Session } from "../../entities/session.entity";
import { Server } from "socket.io";

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
  public async removeSocketById(socketId:string){

    const session = await this.sessionRepository.findOne({
      where:{
        socketId:socketId
      }
    });
    if(session)
      await this.sessionRepository.remove(session);
    
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

  public async getReceiverSockets(senderId:number,receiverId:number){
    
    const sessions = await this.sessionRepository.find({
      where:{
        userId:receiverId,
        targetUserId:senderId
      }
    });
    
    return sessions.map(session => session.socketId);

  }

  
  public async updateLastActiveTime(userId: number, socketId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { userId, socketId },
    });
    if (session) {
      session.updatedAt = new Date(); 
      await this.sessionRepository.save(session);
    }
  }

  
  public async checkInactiveSessions() {
    const INACTIVITY = 30 * 60 * 1000; 
    const currentTime = new Date();

    const sessions = await this.sessionRepository.find();
    const socketIds:string[]=[];

    for (const session of sessions) {
      const lastActive = session.updatedAt.getTime();
      const inactivityDuration = currentTime.getTime() - lastActive;

      if (inactivityDuration > INACTIVITY) {
        socketIds.push(session.socketId);
      }

    }

    return socketIds;

  }

}