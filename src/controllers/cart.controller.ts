import { Body, Controller, Req ,Post, Get, SetMetadata, UseGuards, Delete, Param } from "@nestjs/common";
import { Request } from "express";
import { AddCartMealDto } from "../dtos/cart/add.cart.meal.dto";
import { CartService } from "../services/cart/cart.service";
import { RoleCheckedGuard } from "../misc/role.checked.guard";
import { Roles } from "../misc/roles.descriptor";
import { WorkmanCartDataDto } from "../dtos/cart/workman.cart.data.dto";

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
    @Post("workmanCart")
    async workmanCart(@Req() req:Request,@Body() data:WorkmanCartDataDto){
        return await this.cartService.workmanCart(req.token.id,data.status);
    }

    @UseGuards(RoleCheckedGuard)
    @Roles("workman")
    @Delete("deleteCartMeal/:mealCartId")
    async deleteCartMeal(@Param("mealCartId") id:number,@Req() req:Request){
        console.log(id,req.token.id)
        return await this.cartService.deleteCartMeal(id,req.token.id);
    }
}