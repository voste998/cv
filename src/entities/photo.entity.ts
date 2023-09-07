import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Meal } from "./meal.entity";

@Index("uq_photo_image_path", ["imagePath"], { unique: true })
@Index("uq_photo_meal_id", ["mealId"], { unique: true })
@Entity("photo", { schema: "altera_ketering" })
export class Photo {
  @PrimaryGeneratedColumn({ type: "int", name: "photo_id", unsigned: true })
  photoId: number;

  @Column({type:"varchar",  name: "image_path", unique: true, length: 256 })
  imagePath: string;

  @Column({type:"int",  name: "meal_id", unique: true, unsigned: true })
  mealId: number;

  @OneToOne(() => Meal, (meal) => meal.photo, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "meal_id", referencedColumnName: "mealId" }])
  meal: Meal;
}
