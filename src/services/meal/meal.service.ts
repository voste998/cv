import { Injectable } from "@nestjs/common";
import { DeleteResult, Repository } from "typeorm";
import { Meal } from "../../entities/meal.entity";
import { InjectRepository } from "@nestjs/typeorm";
import ApiResponse from "../../misc/api.response.class";
import { AddMealDto } from "../../dtos/meal/add.meal.dto";
import { MealComponent } from "../../entities/meal.component.entity";
import { MealFilterDataDto } from "../../dtos/meal/meal.filter.data.dto";
import { Photo } from "../../entities/photo.entity";

@Injectable()
export class MealService{
    constructor(
        @InjectRepository(Meal) private readonly meal:Repository<Meal>,
        @InjectRepository(MealComponent) private readonly mealComponent:Repository<MealComponent>
    ){}
    async mealFilter(data:MealFilterDataDto){
        const builder = this.meal.createQueryBuilder("meal");
        builder.where(`meal.day='${data.day}'`);
        if(data.offer)
            builder.andWhere(`meal.offer='${data.offer}'`);
        
        builder.leftJoin(Photo,"photo","photo.meal_id=meal.meal_id");
        
        builder.select("meal.meal_id as mealId");
        builder.addSelect("meal.name as name");
        builder.addSelect("meal.description as description");
        builder.addSelect("meal.offer as offer");
        builder.addSelect("meal.day as day");
        builder.addSelect("photo.photo_id as photoId");
        builder.addSelect("photo.image_path as imagePath");

        return await builder.getRawMany();
    }

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
    
    async newMeal(data:AddMealDto):Promise<Meal|ApiResponse>{
        
        let newMeal:Meal=new Meal();
        newMeal.name=data.name;
        newMeal.day=data.day;
        newMeal.offer=data.offer;
        newMeal.description=data.description;

        newMeal=await this.meal.save(newMeal);

        if(!newMeal)
            return new ApiResponse("error",-6002);

        for(let mc of data.mealComponents){
            try{
                let newMealComp:MealComponent=new MealComponent();
                newMealComp.mealId=newMeal.mealId;
                newMealComp.componentId=mc.componentId;
                newMealComp.quantity=mc.quantity;
                await this.mealComponent.save(newMealComp);
            }catch(e){}
        }

        return await this.meal.findOne({
            where:{
                mealId:newMeal.mealId
            },
            relations:["mealComponents.component"]
        });

        
    }

    async deleteFull(mealId:number):Promise<ApiResponse|DeleteResult>{
        try{
            await this.mealComponent.delete({
                mealId:mealId
            });
        }catch(e){
            return new ApiResponse("error",-6003);
        }

        return await this.meal.delete({
            mealId:mealId
        })
    }

}
