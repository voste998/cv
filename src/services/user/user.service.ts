import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../entities/user.entity";
import { Repository } from "typeorm";
import { UserToken } from "../../entities/user.token.entity";
import { AddUserDto } from "../../dtos/user/add.user.dto";
import ApiResponse from "../../misc/api.response.class";

@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User) private readonly user:Repository<User>,
        @InjectRepository(UserToken) private readonly userToken:Repository<UserToken>
    ){}

    async createNew(data:AddUserDto):Promise<ApiResponse|User>{
        const user=await this.user.findOne({
            where:{
                email:data.email
            }
        });
        if(user)
            return new ApiResponse("error",-5001,"Email is already used.");
        console.log("met")
        const newUser=new User();
        newUser.email=data.email;

        const crypto=require("crypto");
        const passwordHash=crypto.createHash("sha512"); 
        passwordHash.update(data.password);
        const passwordHashString=passwordHash.digest("hex").toUpperCase();

        newUser.passwordHash=passwordHashString;

        newUser.address=data.address;
        newUser.name=data.name;
        newUser.lastname=data.lastname;

        return await this.user.save(newUser);
    }

    getByEmail(email:string){
        return this.user.findOne({
            where:{
                email:email
            }
        })
    }

    async newToken(token:string,userId:number,expriesAt:Date){
        const tokens=await this.userToken.find({
            where:{
                userId:userId,
                isValid:true
            }
        });

        for(let token of tokens){
            token.isValid=false;
            await this.userToken.save(token);
        }

        const newToken=new UserToken();
        newToken.userId=userId;
        newToken.expiresAt=expriesAt;
        newToken.token=token;
        newToken.isValid=true;

        return await this.userToken.save(newToken);
    }

    async getUserToken(token:string){
        return await this.userToken.findOne({
            where:{
                token:token
            }
        });
    }

    getById(id:number){
        return this.user.findOne({
            where:{
                userId:id
            }
        })
    }

}