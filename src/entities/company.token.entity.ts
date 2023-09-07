import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Company } from "./company.entity";

@Index("fk_company_token_company_id", ["companyId"], {})
@Entity("company_token", { schema: "altera_ketering" })
export class CompanyToken {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "company_token_id",
    unsigned: true,
  })
  companyTokenId: number;

  @Column("int", { name: "company_id", unsigned: true })
  companyId: number;

  @Column("text", { name: "token" })
  token: string;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({type:"datetime",  name: "expires_at" })
  expiresAt: Date;

  @Column({type:"bit",  name: "is_valid", default: () => "'b'1''" })
  isValid: boolean;

  @Column({type:"int",  name: "workman_id", unsigned: true })
  workmanId: number;

  @ManyToOne(() => Company, (company) => company.companyTokens, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "company_id", referencedColumnName: "companyId" }])
  company: Company;
}
