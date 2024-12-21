import { HttpException, HttpStatus } from "@nestjs/common";
import {  MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Socket }   from "socket.io";
import { UserSessionService } from "../services/session/user.session.setvice";
import * as jwt from "jsonwebtoken";
import { jwtSecret } from "../../config/jwt.secret";
import { MessageService } from "../services/message/message.service";
import { SendMessageDto } from "../dtos/message/send.message.dto";
import ApiResponse from "../misc/api.response.class";



@WebSocketGateway(3002,{})
export class ChatGateway implements OnGatewayConnection,OnGatewayDisconnect{

    @WebSocketServer() server:Server;

    constructor(
      private readonly userSessionService: UserSessionService,
      private readonly messageService:MessageService
    ) {}

    
    async handleConnection(socket: Socket) {
      try {
        
        const token = (socket.handshake.query.token as string)?.split(' ')[1];
        if (!token) throw new HttpException('Token not found!', HttpStatus.UNAUTHORIZED);
  
        const targetUserId = socket.handshake.query.targetUserId as string;
        if (!targetUserId) throw new HttpException('Target User ID not found!', HttpStatus.BAD_REQUEST);
  
        let decoded: any;
        try {
          decoded = jwt.verify(token, jwtSecret); 
          if (!decoded) throw new HttpException('Token is invalid!', HttpStatus.UNAUTHORIZED);
        } catch (error) {
          throw new HttpException('Token verification failed!', HttpStatus.UNAUTHORIZED);
        }
  
       
        await this.userSessionService.addSocketToSession(decoded.id, socket.id, Number(targetUserId));
  
        
        socket.data.user = { ...decoded, targetUserId: targetUserId };
  
      } catch (error) {
        socket.emit('message', { content: 'Error connecting to the server' });
        socket.disconnect();
      }
    }
  
    
    async handleDisconnect(socket: Socket) {
      try {
        const user = socket.data.user;
        if (user && user.id && user.targetUserId) {
          
          await this.userSessionService.removeSocketFromSession(user.id, socket.id, user.targetUserId);
  
         /* const remainingSockets = await this.userSessionService.getTargetSockets(user.id, user.targetUserId);
          if (remainingSockets.length === 0) {
            await this.userSessionService.removeUserSession(user.id, user.targetUserId);
          }*/
         
        }
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
    }
  
    @SubscribeMessage('sendMessage')
    async handleSendMessage(@MessageBody() data:SendMessageDto, socket: Socket) {
      const { senderId, receiverId, content, type } = data;
      
      const newMessage=await this.messageService.sendMessage(senderId, receiverId, content, type);

      if(newMessage instanceof ApiResponse){
        socket.emit("newMessageError",newMessage);
      }else{
        
        const targetSockets = await this.userSessionService.getTargetSockets(senderId, receiverId);

        targetSockets.forEach(socketId => {
          this.server.to(socketId).emit('newMessage', { newMessage });
        });

      }
      
    }
  
}