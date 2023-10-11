import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Administrator } from "../../entities/administrator.entity";
import { Repository } from "typeorm";
import { AddAdministratorDto } from "../../dtos/administrator/add.administrator.dto";
import ApiResponse from "../../misc/api.response.class";
import { AdministratorToken } from "../../entities/administrator.token.entity";

@Injectable()
export class AdministratorService{
    constructor(
        @InjectRepository(Administrator) private readonly administrator:Repository<Administrator> ,
        @InjectRepository(AdministratorToken) private readonly administratorToken:Repository<AdministratorToken>
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

    async getByUsername(username:string):Promise<Administrator>{
        return await this.administrator.findOne({
            where:{
                username:username
            }
        });
    }

    async newToken(token:string,administratorId:number,expriesAt:Date){
        const tokens=await this.administratorToken.find({
            where:{
                administratorId:administratorId,
                isValid:true
            }
        });

        for(let token of tokens){
            token.isValid=false;
            await this.administratorToken.save(token);
        }

        const newToken=new AdministratorToken();
        newToken.administratorId=administratorId;
        newToken.expiresAt=expriesAt;
        newToken.token=token;
        newToken.isValid=true;

        return await this.administratorToken.save(newToken);
    }

    async getAdminToken(token:string){
        return await this.administratorToken.findOne({
            where:{
                token:token
            }
        });
    }
}
