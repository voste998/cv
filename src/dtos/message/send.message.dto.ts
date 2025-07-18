export class SendMessageDto {
   
   content: string;
    
   type?: 'text' | 'image' | 'file' | 'video' = 'text';
  
}