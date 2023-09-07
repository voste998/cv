import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "./cart.entity";
import { CompanyDay } from "./company.day.entity";
import { CompanyToken } from "./company.token.entity";
import { Workman } from "./workman.entity";

@Index("uq_company_name", ["name"], { unique: true })
@Entity("company", { schema: "altera_ketering" })
export class Company {
  @PrimaryGeneratedColumn({ type: "int", name: "company_id", unsigned: true })
  companyId: number;

  @Column({type:"varchar",  name: "name", unique: true, length: 128 })
  name: string;

  @Column({type:"varchar", name: "password_hash", length: 256 })
  passwordHash: string;

  @Column({type:"smallint",  name: "workpeople", unsigned: true })
  workpeople: number;

  @OneToMany(() => Cart, (cart) => cart.company)
  carts: Cart[];

  @OneToMany(() => CompanyDay, (companyDay) => companyDay.company)
  companyDays: CompanyDay[];

  @OneToMany(() => CompanyToken, (companyToken) => companyToken.company)
  companyTokens: CompanyToken[];

  @OneToMany(() => Workman, (workman) => workman.company)
  workmen: Workman[];
}
