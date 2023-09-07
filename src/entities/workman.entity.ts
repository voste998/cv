import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MealCart } from "./meal.cart.entity";
import { Company } from "./company.entity";

@Index("uq_workman_email", ["email"], { unique: true })
@Index("fk_workman_company_id", ["companyId"], {})
@Entity("workman", { schema: "altera_ketering" })
export class Workman {
  @PrimaryGeneratedColumn({ type: "int", name: "workman_id", unsigned: true })
  workmanId: number;

  @Column({type:"int",  name: "company_id", unsigned: true })
  companyId: number;

  @Column({type:"varchar",  name: "email", unique: true, length: 128 })
  email: string;

  @Column({type:"varchar",  name: "name", length: 128 })
  name: string;

  @Column({type:"varchar",  name: "lastname", length: 128 })
  lastname: string;

  @Column({type:"bit",  name: "is_valid", default: () => "'b'0''" })
  isValid: boolean;

  @OneToMany(() => MealCart, (mealCart) => mealCart.workman)
  mealCarts: MealCart[];

  @ManyToOne(() => Company, (company) => company.workmen, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "company_id", referencedColumnName: "companyId" }])
  company: Company;
}
