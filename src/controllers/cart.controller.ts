import { Body, Controller, Req ,Post, Get, SetMetadata, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AddCartMealDto } from "../dtos/cart/add.cart.meal.dto";
import { CartService } from "../services/cart/cart.service";
import { RoleCheckedGuard } from "../misc/role.checked.guard";
import { Roles } from "../misc/roles.descriptor";

@Controller("api/cart")
export class CartControler{
    constructor(
        private readonly cartService:CartService
    ){}
    
    @UseGuards(RoleCheckedGuard)
    @Roles("workman")
    @Post("addMeal")
    async addWorkmanMeal(@Req() req:Request,@Body() data:AddCartMealDto){
        return await this.cartService.addWorkmanMeal(req.token.id,req.token.companyId as any,data.mealId);
    }
    
    @UseGuards(RoleCheckedGuard)
    @Roles("workman")
    @Get("nextWorkmanCart")
    async nextWorkmanCart(@Req() req:Request){
        return await this.cartService.nextWorkmanCart(req.token.id);
    }
}