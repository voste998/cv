import { Body, Controller, Req ,Post, Get } from "@nestjs/common";
import { Request } from "express";
import { AddCartMealDto } from "../dtos/cart/add.cart.meal.dto";
import { CartService } from "../services/cart/cart.service";

@Controller("api/cart")
export class CartControler{
    constructor(
        private readonly cartService:CartService
    ){}

    @Post("addMeal")
    async addWorkmanMeal(@Req() req:Request,@Body() data:AddCartMealDto){
        return await this.cartService.addWorkmanMeal(req.token.id,req.token.companyId as any,data.mealId);
    }
    @Get("nextWorkmanCart")
    async nextWorkmanCart(@Req() req:Request){
        return await this.cartService.nextWorkmanCart(req.token.id);
    }
}