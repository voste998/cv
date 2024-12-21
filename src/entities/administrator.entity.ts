import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AdministratorToken } from "./administrator.token.entity";

@Index("uq_administrator_username", ["username"], { unique: true })
@Entity("administrator", { schema: "auth_app" })
export class Administrator {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "administrator_id",
    unsigned: true,
  })
  administratorId: number;

  @Column({type:"varchar",  name: "username", unique: true, length: 128 })
  username: string;

  @Column({type:"varchar",  name: "password_hash", length: 256 })
  passwordHash: string;

  @OneToMany(
    () => AdministratorToken,
    (administratorToken) => administratorToken.administrator
  )
  administratorTokens: AdministratorToken[];
}
