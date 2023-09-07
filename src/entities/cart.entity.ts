import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Company } from "./company.entity";
import { MealCart } from "./meal.cart.entity";

@Index("fk_cart_company_id", ["companyId"], {})
@Entity("cart", { schema: "altera_ketering" })
export class Cart {
  @PrimaryGeneratedColumn({ type: "int", name: "cart_id", unsigned: true })
  cartId: number;

  @Column({type:"int",  name: "company_id", unsigned: true })
  companyId: number;

  @Column({
    type:"timestamp", 
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    type:"enum", 
    name: "status",
    enum: ["other", "current", "next"],
    default: () => "'next'",
  })
  status: "other" | "current" | "next";

  @ManyToOne(() => Company, (company) => company.carts, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "company_id", referencedColumnName: "companyId" }])
  company: Company;

  @OneToMany(() => MealCart, (mealCart) => mealCart.cart)
  mealCarts: MealCart[];
}
