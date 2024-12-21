import { NestMiddleware,HttpException,HttpStatus, Injectable } from "@nestjs/common";
import { NextFunction,Request,Response } from "express";
import { AdministratorService } from "../services/administrator/administrator.service";
import { JwtDataDto } from "../dtos/auth/jwt.data.dto";
import * as jwt from "jsonwebtoken";
import { jwtSecret } from "../../config/jwt.secret";
import { UserService } from "../services/user/user.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware{

    constructor(
        private readonly administratorService:AdministratorService,
        private readonly userService:UserService
    ){}

    async use(req:Request,res:Response,next:NextFunction){
        if(!req.headers["authorization"])
            throw new HttpException("Token nije pronadjen!",HttpStatus.UNAUTHORIZED);

        const tokenParts=req.headers.authorization.split(" ");

        if(tokenParts.length!==2)
            throw new HttpException("Ne vazeci token",HttpStatus.UNAUTHORIZED);
        
        let jwtData:JwtDataDto;

        try{
            jwtData=jwt.verify(tokenParts[1],jwtSecret);
        }catch(e){
            throw new HttpException("Ne vazeci token",HttpStatus.UNAUTHORIZED);
        }
        
        if(!jwtData)
            throw new HttpException("Ne vazeci token",HttpStatus.UNAUTHORIZED);
           
        
        if(jwtData.role==="administrator"){
            let admin=await this.administratorService.getById(jwtData.id);
            if(!admin)
                throw new HttpException("Ne vazeci token",HttpStatus.UNAUTHORIZED);
        }
        else if(jwtData.role==="user"){
            let user=await this.userService.getById(jwtData.id);
            if(!user)
                throw new HttpException("Ne vazeci token",HttpStatus.UNAUTHORIZED);
        }
        
        if(jwtData.ip!==req.ip.toString())
            throw new HttpException("Ne vazeci token",HttpStatus.UNAUTHORIZED);
                          
        if(jwtData.ua!==req.headers["user-agent"])
            throw new HttpException("Ne vazeci token",HttpStatus.UNAUTHORIZED);

        const currentTime=new Date();
        
        if(currentTime.getTime()/1000 > jwtData.exp)
            throw new HttpException("Ne vazeci token",HttpStatus.UNAUTHORIZED);

        req.token=jwtData;
        
        next();
    }
}