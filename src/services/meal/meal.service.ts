import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Meal } from "../../entities/meal.entity";
import { InjectRepository } from "@nestjs/typeorm";
import ApiResponse from "../../misc/api.response.class";

@Injectable()
export class MealService{
    constructor(
        @InjectRepository(Meal) private readonly meal:Repository<Meal>
    ){}

    async getMealById(id:number):Promise<Meal|ApiResponse>{
        const meal= await this.meal.findOne({
            where:{
                mealId:id
            }
        });
        if(!meal)
            return new ApiResponse("error",-6001);

        return meal;
    }
}
