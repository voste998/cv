import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user/user.service";
import { AddUserDto } from "../dtos/user/add.user.dto";
import { RoleCheckedGuard } from "../misc/role.checked.guard";
import { Roles } from "../misc/roles.descriptor";

@Controller("api/user")
export class UserController{
    constructor(
        private readonly userService:UserService
    ){}

    
    @Post("createNew")
    async createNew(@Body() data:AddUserDto){
        return await this.userService.createNew(data);
    }

    @UseGuards(RoleCheckedGuard)
    @Roles("user")
    @Post("test")
    test(){
        return{
            data:"test message"
        }
    }



   
}