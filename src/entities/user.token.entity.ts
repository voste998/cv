import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
  } from "typeorm";

  
  @Entity("user_token", { schema: "auth_app" })
  export class UserToken {
    @PrimaryGeneratedColumn({
      type: "int",
      name: "user_token_id",
      unsigned: true,
    })
    userTokenId: number;
  
    @Column({type:"int",  name: "user_id", unsigned: true })
    userId: number;
  
    @Column({type:"text",  name: "token" })
    token: string;
  
    @Column({
      type:"timestamp", 
      name: "created_at",
      default: () => "CURRENT_TIMESTAMP",
    })
    createdAt: Date;
  
    @Column({type:"datetime",  name: "expires_at" })
    expiresAt: Date;
  
    @Column({type:"bit",  name: "is_valid" })
    isValid: boolean;

  }
  