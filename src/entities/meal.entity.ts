import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MealCart } from "./meal.cart.entity";
import { MealComponent } from "./meal.component.entity";
import { Photo } from "./Photo";

@Index("uq_meal_name_day", ["name", "day"], { unique: true })
@Entity("meal", { schema: "altera_ketering" })
export class Meal {
  @PrimaryGeneratedColumn({ type: "int", name: "meal_id", unsigned: true })
  mealId: number;

  @Column({type:"varchar",  name: "name", length: 128 })
  name: string;

  @Column({type:"enum",  name: "offer", enum: ["constant", "exchangeable"] })
  offer: "constant" | "exchangeable";

  @Column({type:"enum",  name: "day", enum: ["0", "1", "2", "3", "4", "5", "6"] })
  day: "0" | "1" | "2" | "3" | "4" | "5" | "6";

  @OneToMany(() => MealCart, (mealCart) => mealCart.meal)
  mealCarts: MealCart[];

  @OneToMany(() => MealComponent, (mealComponent) => mealComponent.meal)
  mealComponents: MealComponent[];

  @OneToOne(() => Photo, (photo) => photo.meal)
  photo: Photo;
}
