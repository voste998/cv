import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Administrator } from "../../entities/administrator.entity";
import { Repository } from "typeorm";
import { AddAdministratorDto } from "../../dtos/administrator/add.administrator.dto";
import ApiResponse from "../../misc/api.response.class";

@Injectable()
export class AdministratorService{
    constructor(
        @InjectRepository(Administrator) private readonly administrator:Repository<Administrator> 
    ){}

    async createNew(data:AddAdministratorDto):Promise<ApiResponse|Administrator>{
        const admin=await this.administrator.findOne({
            where:{
                username:data.username
            }
        });
        if(admin)
            return new ApiResponse("error",-4001,"Korisnicko ime je zauzeto!");

        const newAdmin=new Administrator();
        newAdmin.username=data.username;

        const crypto=require("crypto");
        const passwordHash=crypto.createHash("sha512"); 
        passwordHash.update(data.password);
        const passwordHashString=passwordHash.digest("hex").toUpperCase();

        newAdmin.passwordHash=passwordHashString;

        return await this.administrator.save(newAdmin);
    }

    async getById(id:number):Promise<Administrator>{
        return await this.administrator.findOne({
            where:{
                administratorId:id
            }
        })
    }
}
