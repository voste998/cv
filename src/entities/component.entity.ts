import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MealComponent } from "./meal.component.entity";

@Index("uq_component_name", ["name"], { unique: true })
@Entity("component", { schema: "altera_ketering" })
export class Component {
  @PrimaryGeneratedColumn({ type: "int", name: "component_id", unsigned: true })
  componentId: number;

  @Column({type:"varchar",  name: "name", unique: true, length: 64 })
  name: string;

  @Column({type:"decimal",  name: "quantity", precision: 4, scale: 1 })
  quantity: string;

  @Column({type:"varchar",  name: "mark", length: 16 })
  mark: string;

  @OneToMany(() => MealComponent, (mealComponent) => mealComponent.component)
  mealComponents: MealComponent[];
}
