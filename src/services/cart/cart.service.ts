import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from "../../entities/cart.entity";
import { Repository } from "typeorm";
import ApiResponse from "../../misc/api.response.class";
import { MealCart } from "../../entities/meal.cart.entity";
import { MealService } from "../meal/meal.service";
import { MealCartWorkman } from "../../entities/meal.cart.workman.entity";

@Injectable()
export class CartService{
    constructor(
        @InjectRepository(Cart) private readonly cart:Repository<Cart>,
        @InjectRepository(MealCart) private readonly mealCart:Repository<MealCart>,
        @InjectRepository(MealCartWorkman) private readonly mealCartWorkman:Repository<MealCartWorkman>,
        private readonly mealService:MealService
    ){}

    async addWorkmanMeal(workmanId:number,companyId:number,mealId:number){
        const nextCart=await this.cart.findOne({
            where:{
                companyId:companyId,
                status:"next"
            },
            relations:["company.companyDays"]
        });
        if(!nextCart)
            return new ApiResponse("error",-5001);

        const meal=await this.mealService.getMealById(mealId);
        if(meal instanceof ApiResponse)
            return meal;

        const workmanCartMeals=await this.mealCart.find({
            where:{
                cartId:nextCart.cartId,
                workmanId:workmanId,
                
            },
            relations:["meal"]
        });

        for(let cartMeal of workmanCartMeals){
            if(cartMeal.meal.day===meal.day)
                await this.mealCart.delete({
                    mealCartId:cartMeal.mealCartId
                });
        }

        const newCartMeal=new MealCart();
        newCartMeal.cartId=nextCart.cartId;
        newCartMeal.workmanId=workmanId;
        newCartMeal.mealId=mealId;

    
        return await this.mealCart.save(newCartMeal);
    
    }

    async nextWorkmanCart(workmanId:number):Promise<any>{
        return await this.mealCartWorkman.find({
            where:{
                workmanId:workmanId,
                status:"next"
            }
        });
    }
}