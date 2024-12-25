import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('session')
@Entity("session", { schema: "auth_app" })
export class Session {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "session_id",
    unsigned: true,
  })
  sessionId: number;

  @Column({name:"user_id", type: 'int', unsigned:true})
  userId: number;

  @Column({type:"varchar",length:"255",  name: "socket_id"}) 
  socketId:string;

  @Column({ name:"connected_at",type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  connectedAt: Date;

  @Column({ name:"updated_at",type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;


  @Column({name:"target_user_id", type: 'int', unsigned:true, default:()=>null})
  targetUserId: number|null;
}