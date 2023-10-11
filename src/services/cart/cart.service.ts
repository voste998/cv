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

    async test(workmanId:number,status:"next"|"current"):Promise<any>{
        return await this.mealCartWorkman.find({
            where:{
                workmanId:workmanId,
                status:status
            }
        });
    }

    async workmanCart(workmanId:number,status:"next"|"current"|"previous"){
        const carts=await this.cart.find({
            where:{
                status:status==="previous"?"other":status,
                mealCarts:{
                    workmanId:workmanId
                }
            },
            relations:["mealCarts.meal"],
            select:{
                cartId:true,
                createdAt:true,
                status:true,
                mealCarts:{
                    mealCartId:true,
                    meal:{
                        mealId:true,
                        name:true,
                        day:true
                    }
                }
            },
            order:{
                createdAt:"DESC"
            },
            skip:0,
            take:1
        });
        
        if(carts.length!==0)
            return carts[0];

        
    }
    async deleteCartMeal(mealCartId:number,workmanId:number){
        const mealCart=await this.mealCart.findOne({
            where:{
                mealCartId:mealCartId,
                workmanId:workmanId
            },
            relations:["cart"]
        });
        if(!mealCart)
            return new ApiResponse("error",5002);

        if(mealCart.cart.status!=="next")
            return new ApiResponse("error",5003);

        return await this.mealCart.delete(mealCart);
    }
}