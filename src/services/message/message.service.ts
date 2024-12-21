import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { MarkMessagesAsReadDto } from '../../dtos/message/mark.message.as.read.dto';
import ApiResponse from '../../misc/api.response.class';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async sendMessage(senderId: number, receiverId: number,
     content: string, type:"text" | "image" | "file" | "video" = 'text'):Promise<Message|ApiResponse> {
    const newMessage:Message=new Message();
    newMessage.content=content;
    newMessage.receiverId=receiverId;
    newMessage.senderId=senderId;
    newMessage.type=type;

    let newMessageData;

    try{
      newMessageData=await this.messageRepository.save(newMessage);
    }catch(e){
      return new ApiResponse("error",5002);
    }
    return newMessageData;
  }

  async getMessages(senderId: number, receiverId: number,skip:number=0) {
    return await this.messageRepository.find({
      where: {
        senderId:senderId,
        receiverId:receiverId
      },
      order: { createdAt: 'ASC' }, 
      skip:skip*20,
      take:20
    });
  }

  async markMessagesAsRead(messageIds:number[]):Promise<ApiResponse|MarkMessagesAsReadDto> {
    const messages = await this.messageRepository.find(
      { where: { messageId: In(messageIds)  } 
    });
    const messageIdsMarked:MarkMessagesAsReadDto={
      messageIds:[]
    }
    for(let message of messages){
      message.isRead = true;
      try{
        await this.messageRepository.save(message);
        messageIdsMarked.messageIds.push(message.messageId)
      }catch(e){
        return new ApiResponse("error",5001) 
      }
      
    }
    
    return messageIdsMarked;
  }
}