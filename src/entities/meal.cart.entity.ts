import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "./cart.entity";
import { Meal } from "./meal.entity";
import { Workman } from "./workman.entity";

@Index("fk_meal_cart_meal_id", ["mealId"], {})
@Index("fk_meal_cart_workman_id", ["workmanId"], {})
@Index("fk_meal_cart_cart_id", ["cartId"], {})
@Entity("meal_cart", { schema: "altera_ketering" })
export class MealCart {
  @PrimaryGeneratedColumn({ type: "int", name: "meal_cart_id", unsigned: true })
  mealCartId: number;

  @Column({type:"int",  name: "cart_id", unsigned: true })
  cartId: number;

  @Column({type:"int",  name: "meal_id", unsigned: true })
  mealId: number;

  @Column({type:"int",  name: "workman_id", unsigned: true })
  workmanId: number;

  @ManyToOne(() => Cart, (cart) => cart.mealCarts, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "cart_id", referencedColumnName: "cartId" }])
  cart: Cart;

  @ManyToOne(() => Meal, (meal) => meal.mealCarts, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "meal_id", referencedColumnName: "mealId" }])
  meal: Meal;

  @ManyToOne(() => Workman, (workman) => workman.mealCarts, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "workman_id", referencedColumnName: "workmanId" }])
  workman: Workman;
}
