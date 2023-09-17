import { Controller , Post ,Body, Delete, Param, SetMetadata, UseGuards} from "@nestjs/common";
import { MealService } from "../services/meal/meal.service";
import { AddMealDto } from "../dtos/meal/add.meal.dto";
import ApiResponse from "../misc/api.response.class";
import { Meal } from "../entities/meal.entity";
import { Roles } from "../misc/roles.descriptor";
import { RoleCheckedGuard } from "../misc/role.checked.guard";

@Controller("api/meal")
export class MealController{
    constructor(
        private readonly mealService:MealService
    ){}

    @UseGuards(RoleCheckedGuard)
    @Roles("administrator")
    @Post("newMeal")
    async newMeal(@Body() data:AddMealDto):Promise<Meal|ApiResponse>{
        return await this.mealService.newMeal(data);
    }

    @UseGuards(RoleCheckedGuard)
    @Roles("administrator")
    @Delete("deleteFull/:mealId")
    async deleteFull(@Param("mealId") mealId:number){
        return await this.mealService.deleteFull(mealId);
    }

}