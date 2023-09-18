import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AdministratorService } from "../services/administrator/administrator.service";
import { AddAdministratorDto } from "../dtos/administrator/add.administrator.dto";
import { RoleCheckedGuard } from "../misc/role.checked.guard";
import { Roles } from "../misc/roles.descriptor";


@Controller("api/administrator")
export class AdministratorController{
    constructor(
        private readonly administratorService:AdministratorService
    ){}

    @UseGuards(RoleCheckedGuard)
    @Roles("administrator")
    @Post("createNew")
    async createNew(@Body() data:AddAdministratorDto){
        return await this.administratorService.createNew(data);
    }
}