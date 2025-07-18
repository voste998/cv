import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { MarkMessagesAsReadDto } from '../../dtos/message/mark.message.as.read.dto';
import ApiResponse from '../../misc/api.response.class';
import { SendMessageDto } from '../../dtos/message/send.message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async sendMessage(data:{
    senderId:number,
    receiverId:number,
    type:"text"|"image"|"file"|"video",
    content:string
  }):Promise<Message|ApiResponse> {
    const {senderId,receiverId,type,content}=data
    
    const newMessage:Message={
      type:type,
      content:content, 
      senderId:senderId,
      receiverId:receiverId,
    } as any
    
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
    let messages = await this.messageRepository.find(
      { where: { messageId: In(messageIds)  } 
    });
    
    for(let message of messages)
      message.isRead = true;
      
    try{
      messages=await this.messageRepository.save(messages);
    }catch(e){
      return new ApiResponse("error",5001) 
    }

    const messageIdsMarked:MarkMessagesAsReadDto={

      messageIds:messages.map(message=>{
        return message.messageId;
      })

    }
    
    return messageIdsMarked ;
  }
}