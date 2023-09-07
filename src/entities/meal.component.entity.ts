import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Component } from "./component.entity";
import { Meal } from "./meal.entity";

@Index("uq_meal_component_meal_id_component_id", ["mealId", "componentId"], {
  unique: true,
})
@Index("fk_meal_component_component_id", ["componentId"], {})
@Entity("meal_component", { schema: "altera_ketering" })
export class MealComponent {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "meal_component_id",
    unsigned: true,
  })
  mealComponentId: number;

  @Column({type:"int",  name: "meal_id", unsigned: true })
  mealId: number;

  @Column({type:"int",  name: "component_id", unsigned: true })
  componentId: number;

  @Column({type:"decimal",  name: "quantity", precision: 4, scale: 1 })
  quantity: string;

  @ManyToOne(() => Component, (component) => component.mealComponents, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "component_id", referencedColumnName: "componentId" }])
  component: Component;

  @ManyToOne(() => Meal, (meal) => meal.mealComponents, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "meal_id", referencedColumnName: "mealId" }])
  meal: Meal;
}
