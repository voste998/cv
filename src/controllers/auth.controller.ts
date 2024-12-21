import { Body, Controller,Post,Req,HttpException,HttpStatus, Get } from "@nestjs/common";
import ApiResponse from "../misc/api.response.class";
import { JwtRefreshDataDto } from "../dtos/auth/jwt.refresh.data.dto";
import { Request } from "express";
import { jwtRefreshSecret, jwtSecret } from "../../config/jwt.secret";
import * as jwt from "jsonwebtoken";
import { JwtDataDto } from "../dtos/auth/jwt.data.dto";
import { RefreshInfoDto } from "../dtos/auth/refresh.info.dto";
import { LoginAdministratorDto } from "../dtos/auth/login.administrator.dto";
import { AdministratorService } from "../services/administrator/administrator.service";
import { LoginAdministratorInfoDto } from "../dtos/auth/login.administrator.info.dto";
import { AdministratorRefreshTokenDto } from "../dtos/administrator/administrator.refresh.token.dto";
import { UserService } from "../services/user/user.service";
import { LoginUserDto } from "../dtos/auth/login.user.dto";
import { LoginUserInfoDto } from "../dtos/auth/login.user.info.dto";
import { UserRefreshTokenDto } from "../dtos/user/user.refresh.token.dto";


@Controller("auth") 
export class AuthController{

    constructor(
        private readonly administratorService:AdministratorService,
        private readonly userService:UserService
    ){}

    @Post("administrator/login")
    async adminLogin(@Body() data:LoginAdministratorDto,@Req() req:Request){
        const admin=await this.administratorService.getByUsername(data.username);
        if(!admin)
            return new ApiResponse("error",-3005);

        const crypto=require("crypto");
        const passwordHash=crypto.createHash("sha512");
        passwordHash.update(data.password);
        const passwordHashString=passwordHash.digest("hex").toUpperCase();

        if(passwordHashString!==admin.passwordHash)
            return new ApiResponse("error",-3005);

        const jwtRefreshData=new JwtRefreshDataDto();
        jwtRefreshData.role="administrator";
        jwtRefreshData.identity=admin.username;
        jwtRefreshData.id=admin.administratorId;
        jwtRefreshData.ip=req.ip.toString();
        jwtRefreshData.ua=req.headers["user-agent"];
    
        let currentTime=new Date();
        currentTime.setDate(currentTime.getDate()+14);
        const expires=currentTime.getTime()/1000;
    
        jwtRefreshData.exp=expires;
    
        const refresToken=jwt.sign(jwtRefreshData.toPlain(),jwtRefreshSecret);

        const newAdminToken=await this.administratorService.newToken(refresToken,admin.administratorId,currentTime);

        const jwtData=new JwtDataDto();
        jwtData.role="administrator";
        jwtData.identity=admin.username;
        jwtData.id=admin.administratorId;
        jwtData.ip=req.ip.toString();
        jwtData.ua=req.headers["user-agent"];

        const expAt=new Date();
        expAt.setMinutes(expAt.getMinutes()+5);

        jwtData.exp=expAt.getTime()/1000;

        const token = jwt.sign(jwtData.toPlain(),jwtSecret);

        const loginInfo=new LoginAdministratorInfoDto();
        loginInfo.refreshToken=refresToken;
        loginInfo.token=token;

        return loginInfo;

    }

    @Post("user/login")
    async userLogin(@Body() data:LoginUserDto,@Req() req:Request){
        const user=await this.userService.getByEmail(data.email);
        if(!user)
            return new ApiResponse("error",-3005,"Invalid email.");

        const crypto=require("crypto");
        const passwordHash=crypto.createHash("sha512");
        passwordHash.update(data.password);
        const passwordHashString=passwordHash.digest("hex").toUpperCase();

        if(passwordHashString!==user.passwordHash)
            return new ApiResponse("error",-3006,"Invalid password.");

        const jwtRefreshData=new JwtRefreshDataDto();
        jwtRefreshData.role="user";
        jwtRefreshData.identity=user.email;
        jwtRefreshData.id=user.userId;
        jwtRefreshData.ip=req.ip.toString();
        jwtRefreshData.ua=req.headers["user-agent"];
    
        let currentTime=new Date();
        currentTime.setDate(currentTime.getDate()+14);
        const expires=currentTime.getTime()/1000;
    
        jwtRefreshData.exp=expires;
    
        const refresToken=jwt.sign(jwtRefreshData.toPlain(),jwtRefreshSecret);

        const newUserToken=await this.userService.newToken(refresToken,user.userId,currentTime);
        
        const jwtData=new JwtDataDto();
        jwtData.role="user";
        jwtData.identity=user.email;
        jwtData.id=user.userId;
        jwtData.ip=req.ip.toString();
        jwtData.ua=req.headers["user-agent"];

        const expAt=new Date();
        expAt.setMinutes(expAt.getMinutes()+5);

        jwtData.exp=expAt.getTime()/1000;

        const token = jwt.sign(jwtData.toPlain(),jwtSecret);

        const loginInfo=new LoginUserInfoDto();
        loginInfo.refreshToken=refresToken;
        loginInfo.token=token;

        return loginInfo;

    }
    
    
    
    


    @Post("administrator/refresh")
    async refreshAdminToken(@Body() data:AdministratorRefreshTokenDto,@Req() req:Request){
        const token=await this.administratorService.getAdminToken(data.refreshToken);
        if(!token)
            return new ApiResponse("error",3010,"Token ne postoji!");

        console.log(token)
        console.log(token.isValid)
        if(token.isValid[0]===0)
            return new ApiResponse("error",3011,"Token nije validan!");
        
            

        const admin=await this.administratorService.getById(token.administratorId);

        if(!admin)
            return new ApiResponse("error",3012,"Nepostojeci administrator!");
        
        const expTime=token.expiresAt.getTime();
        const currentTime=new Date().getTime();

        if(expTime < currentTime)
            return new ApiResponse("error",-3013,"Isteklo vazenje tokena!");

        let jwtRefreshData:JwtRefreshDataDto;

        try{
            jwtRefreshData=jwt.verify(token.token,jwtRefreshSecret);
        }catch(e){
            throw new HttpException("Ne vazeci token!",HttpStatus.UNAUTHORIZED);
        }
        

        if(!jwtRefreshData)
            throw new HttpException("Ne vazeci token!",HttpStatus.UNAUTHORIZED);
        
        if(jwtRefreshData.ip!==req.ip.toString())
            throw new HttpException("Ne vazeci token!",HttpStatus.UNAUTHORIZED);
        
        if(jwtRefreshData.ua!==req.headers["user-agent"])
            throw new HttpException("Ne vazeci token!",HttpStatus.UNAUTHORIZED);

        const jwtData:JwtDataDto=new JwtDataDto();
        jwtData.role="administrator";
        jwtData.id=jwtRefreshData.id;
        jwtData.identity=jwtRefreshData.identity;
        jwtData.ip=jwtRefreshData.ip;
        jwtData.ua=jwtRefreshData.ua;

        const expAt=new Date();
        expAt.setMinutes(expAt.getMinutes()+5);

        jwtData.exp=expAt.getTime()/1000;

        const newToken=jwt.sign(jwtData.toPlain(),jwtSecret);

        const refreshInfo:RefreshInfoDto={
            token:newToken,
            refreshToken:token.token
        };

        return refreshInfo;
    }

    @Post("user/refresh")
    async refreshUserToken(@Body() data:UserRefreshTokenDto,@Req() req:Request){
        console.log(data.refreshToken)
        const token=await this.userService.getUserToken(data.refreshToken);
        if(!token)
            return new ApiResponse("error",3010,"Token ne postoji!");

        if(token.isValid[0]===0)
            return new ApiResponse("error",3011,"Token nije validan!");
        
            

        const user=await this.userService.getById(token.userId);

        if(!user)
            return new ApiResponse("error",3012,"User not exist.");
        
        const expTime=token.expiresAt.getTime();
        const currentTime=new Date().getTime();

        if(expTime < currentTime)
            return new ApiResponse("error",-3013,"Isteklo vazenje tokena!");

        let jwtRefreshData:JwtRefreshDataDto;

        try{
            jwtRefreshData=jwt.verify(token.token,jwtRefreshSecret);
        }catch(e){
            throw new HttpException("Ne vazeci token!",HttpStatus.UNAUTHORIZED);
        }
        

        if(!jwtRefreshData)
            throw new HttpException("Ne vazeci token!",HttpStatus.UNAUTHORIZED);
        
        if(jwtRefreshData.ip!==req.ip.toString())
            throw new HttpException("Ne vazeci token!",HttpStatus.UNAUTHORIZED);
        
        if(jwtRefreshData.ua!==req.headers["user-agent"])
            throw new HttpException("Ne vazeci token!",HttpStatus.UNAUTHORIZED);

        const jwtData:JwtDataDto=new JwtDataDto();
        jwtData.role="user";
        jwtData.id=jwtRefreshData.id;
        jwtData.identity=jwtRefreshData.identity;
        jwtData.ip=jwtRefreshData.ip;
        jwtData.ua=jwtRefreshData.ua;

        const expAt=new Date();
        expAt.setMinutes(expAt.getMinutes()+5);

        jwtData.exp=expAt.getTime()/1000;

        const newToken=jwt.sign(jwtData.toPlain(),jwtSecret);

        const refreshInfo:RefreshInfoDto={
            token:newToken,
            refreshToken:token.token
        };

        return refreshInfo;
    }

    @Get("isAuthenticated")
    isAuthenticated(@Req() req:Request){
        return {
            role:req.token.role
        }
    }

}