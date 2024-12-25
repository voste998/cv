import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';


@Entity("message", { schema: "auth_app" })
export class Message {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "message_id",
    unsigned: true,
  })
  messageId: number;

  @Column({
    type: "int",
    name: "sender_id",
    unsigned: true,
  })
  senderId: number; 

  @Column({
    type: "int",
    name: "receiver_id",
    unsigned: true,
  })
  receiverId: number; 

  @Column({type:'text',name:"content"})
  content: string; 

  @Column({type:'boolean', name:"is_read", default:false})
  isRead: boolean; 

  @Column({
    type:"timestamp",
    name:"created_at",
    default:()=>"CURRENT_TIMESTAMP"
  })
  createdAt: Date; 

  @Column({name:"type", type: 'enum', enum: ['text', 'image', 'file', 'video'], default: 'text' })
  type: 'text'| 'image'| 'file'| 'video'; 

  @Column({
    type:"date",
    name:"updated_at",
    default:()=>"CURRENT_TIMESTAMP"
  })
  updatedAt: Date; 

 
}