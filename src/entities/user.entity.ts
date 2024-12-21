import {
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn,
  } from "typeorm";
  
  @Index("uq_user_email", ["email"], { unique: true })
  @Entity("user", { schema: "auth_app" })
  export class User {
    @PrimaryGeneratedColumn({
      type: "int",
      name: "user_id",
      unsigned: true,
    })
    userId: number;
  
    @Column({type:"varchar",  name: "email", unique: true, length: 128 })
    email: string;
  
    @Column({type:"varchar",  name: "password_hash", length: 256 })
    passwordHash: string;

    @Column({type:"varchar",  name: "address", length: 128 })
    address: string;

    @Column({type:"varchar",  name: "name", length: 64 })
    name: string;

    @Column({type:"varchar",  name: "lastname", length: 64 })
    lastname: string;
    
   
  }
  