import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { WorkmanService } from "../services/workman/workman.service";
import { Roles } from "../misc/roles.descriptor";
import { RoleCheckedGuard } from "../misc/role.checked.guard";

@Controller("api/workman")
export class WorkmanController{
    constructor(
        private readonly workmanService:WorkmanService
    ){}

    @UseGuards(RoleCheckedGuard)
    @Roles("workman")
    @Get("plainInfo")
    async workmanPlainInfo(@Req() req:Request){
        return await this.workmanService.workmanPlainInfo(req.token.id)
    }

    @UseGuards(RoleCheckedGuard)
    @Roles("workman")
    @Get("info")
    async workmanInfo(@Req() req:Request){
        return await this.workmanService.workmanInfo(req.token.id)
    }
}