import { Controller, Post, Body, Get, Param, Query, Patch } from '@nestjs/common';

import { SendMessageDto } from '../dtos/message/send.message.dto';
import { MarkMessagesAsReadDto } from '../dtos/message/mark.message.as.read.dto';
import { MessageService } from '../services/message/message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}


  

  
  @Get(':senderId/:receiverId')
  async getMessages(
    @Param('senderId') senderId: number,
    @Param('receiverId') receiverId: number,
    @Query('skip') skip: number = 0,
  ) {
    return this.messageService.getMessages(senderId, receiverId, skip);
  }

  @Patch('read')
  async markMessagesAsRead(
    @Body() markMessagesAsReadDto: MarkMessagesAsReadDto,
  ) {
    const { messageIds } = markMessagesAsReadDto;
    return await this.messageService.markMessagesAsRead(messageIds);
  }
}