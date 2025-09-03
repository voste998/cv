import { HttpException, HttpStatus, OnModuleInit } from "@nestjs/common";
import {  ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Socket }   from "socket.io";
import { UserSessionService } from "../services/session/user.session.service";
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
export class ChatGateway implements OnGatewayConnection,OnGatewayDisconnect,OnModuleInit{

    @WebSocketServer() server:Server;

    constructor(
      private readonly userSessionService: UserSessionService,
      private readonly messageService:MessageService, 
      private readonly sessionCleanerService:SessionCleanerService
    ) {}

    onModuleInit() {
      this.sessionCleanerService.setServer(this.server);
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
        socket.emit('connectionError', { content: 'Error connecting to the server' });
        socket.disconnect(true);
      }
    
    }
    //
    async handleDisconnect(socket: Socket) {
      
      try {
        const user = socket.data.user;
        
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
      

      this.userSessionService.updateLastActiveTime(socket.data.user.id, socket.id);
      
      const newMessage=await this.messageService.sendMessage({
        content:data.content,
        type:!data.type?"text":data.type,
        senderId:socket.data.user.id,
        receiverId:socket.data.user.targetUserId
       });

      if(newMessage instanceof ApiResponse){
        socket.emit("newMessageError",newMessage);
      }else{
        
        const targetSockets = await this.userSessionService.
                getTargetSockets(socket.data.user.id, socket.data.user.targetUserId);

        targetSockets.forEach(socketId => {
          this.server.to(socketId).emit('newMessage', { newMessage });
        });

      }
      
    }
    @SubscribeMessage('markAsRead')
    async markMessagesAsRead(@MessageBody() data:MarkMessagesAsReadDto,socket:Socket){
      
      let ids=await this.messageService.markMessagesAsRead(data.messageIds);

      if(ids instanceof ApiResponse){
        socket.emit("isRead",{error:""})
        }else{
          const targetSockets = await this.userSessionService.
                  getTargetSockets(socket.data.user.id, socket.data.user.targetUserId);

          targetSockets.forEach(socketId=>{
            this.server.to(socketId).emit("isRead",{ids});
          })

        }
    }
    @SubscribeMessage('isTyping')
    async isTyping(socket:Socket){
      this.userSessionService.updateLastActiveTime(socket.data.user.id, socket.id);

      const receiverSockets = await this.userSessionService.
                getReceiverSockets(socket.data.user.id, socket.data.user.targetUserId);

       receiverSockets.forEach(socketId=>{
        this.server.to(socketId).emit("typing",{});
       })         
       
    }
}