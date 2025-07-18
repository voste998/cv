import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "../entities/message.entity";
import { Session } from "../entities/session.entity";
import { ChatGateway } from "./chat.gateway";
import { UserSessionService } from "../services/session/user.session.service";
import { MessageService } from "../services/message/message.service";
import { SessionCleanerService } from "../services/session/session.cleaner.service";

@Module({
    imports: [
      TypeOrmModule.forFeature([Session, Message]), 
    ],
    providers: [
      ChatGateway,               
      UserSessionService,        
      MessageService, 
      SessionCleanerService           
    ],

  })
  export class ChatModule {}
