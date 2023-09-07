import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Company } from "./company.entity";

@Index("uq_company_day_company_id_day", ["companyId", "day"], { unique: true })
@Entity("company_day", { schema: "altera_ketering" })
export class CompanyDay {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "company_day_id",
    unsigned: true,
  })
  companyDayId: number;

  @Column({type:"int",  name: "company_id", unsigned: true })
  companyId: number;

  @Column({type:"enum",  name: "day", enum: ["0", "1", "2", "3", "4", "5", "6"] })
  day: "0" | "1" | "2" | "3" | "4" | "5" | "6";

  @ManyToOne(() => Company, (company) => company.companyDays, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "company_id", referencedColumnName: "companyId" }])
  company: Company;
}
