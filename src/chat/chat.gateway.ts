import { HttpException, HttpStatus } from "@nestjs/common";
import {  ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Socket }   from "socket.io";
import { UserSessionService } from "../services/session/user.session.setvice";
import * as jwt from "jsonwebtoken";
import { jwtSecret } from "../../config/jwt.secret";
import { MessageService } from "../services/message/message.service";
import { SendMessageDto } from "../dtos/message/send.message.dto";
import ApiResponse from "../misc/api.response.class";
import { MarkMessagesAsReadDto } from "../dtos/message/mark.message.as.read.dto";
import { SessionCleanerService } from "../services/session/session.cleaner.service";



@WebSocketGateway(3002, {
  cors: {
    origin: '*', 
  },
})
export class ChatGateway implements OnGatewayConnection,OnGatewayDisconnect{

    @WebSocketServer() server:Server;

    constructor(
      private readonly userSessionService: UserSessionService,
      private readonly messageService:MessageService, 
    ) {
      
    }

    
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
  
        
        socket.data.user = { ...decoded, targetUserId: Number(targetUserId) };
  
      } catch (error) {
        socket.emit('message', { content: 'Error connecting to the server' });
        socket.disconnect(true);
      }
    }
  
    
    async handleDisconnect(socket: Socket) {
      try {
        const user = socket.data.user;

        this.server.sockets.sockets.get(socket.id)?.disconnect(true);
        
        if (user.id) {
          this.userSessionService.removeSocketFromSession(user.id, socket.id, user.targetUserId);
        }
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
    }
  
    @SubscribeMessage('sendMessage')
    async handleSendMessage( @ConnectedSocket() socket: Socket,@MessageBody() message:string) {
      const data:SendMessageDto=JSON.parse(message);
      

      this.userSessionService.updateLastActiveTime(data.senderId, socket.id);
    
      const newMessage=await this.messageService.sendMessage(data);

      if(newMessage instanceof ApiResponse){
        socket.emit("newMessageError",newMessage);
      }else{
        
        const targetSockets = await this.userSessionService.getTargetSockets(data.senderId, data.receiverId);

        targetSockets.forEach(socketId => {
          this.server.to(socketId).emit('newMessage', { newMessage });
        });

      }
      
    }
    @SubscribeMessage('markMessageAsRead')
    async markMessagesAsRead(@MessageBody() data:MarkMessagesAsReadDto,socket:Socket){
      
      let ids=await this.messageService.markMessagesAsRead(data.messageIds);

      if(ids instanceof ApiResponse){
          socket.emit("markError",{ids});
        }else{
          const targetSockets = await this.userSessionService.
                  getTargetSockets(socket.data.user.id, socket.data.user.targetUserId);

          targetSockets.forEach(socketId=>{
            this.server.to(socketId).emit("markedMessages",{ids});
          })

        }
    }
    @SubscribeMessage('isTyping')
    async isTyping(socket:Socket){
      
    }
}