export class SendMessageDto {
   
    senderId: number;
  

    receiverId: number;
  
    
    content: string;
  
    
    type?: 'text' | 'image' | 'file' | 'video' = 'text';
  }