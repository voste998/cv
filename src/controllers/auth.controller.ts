import { Body, Controller,Get,Param,Post,Req,HttpException,HttpStatus, UseGuards } from "@nestjs/common";
import { LoginWorkmanDto } from "../dtos/auth/login.workman.dto";
import { WorkmanService } from "../services/workman/workman.service";
import ApiResponse from "../misc/api.response.class";
import { CompanyService } from "../services/company/company.service";
import { JwtRefreshDataDto } from "../dtos/auth/jwt.refresh.data.dto";
import { Request } from "express";
import { jwtRefreshSecret, jwtSecret, jwtTokenValidationSecret, jwtValidationSecret } from "../../config/jwt.secret";
import * as jwt from "jsonwebtoken";
import { LoginWorkmanInfoDto } from "../dtos/auth/login.workman.info.dto";
import { JwtDataCompanyTokenValidation } from "../dtos/company/jwt.data.company.token.validation";
import { CompanyMailer } from "../services/company/company.mailer.service";
import { Workman } from "../entities/workman.entity";
import { JwtDataWorkmanValidationDto } from "../dtos/workman/jwt.data.workman.validation.dto";
import { AddWorkmanDto } from "../dtos/workman/add.workman.dto";
import { WorkmanMailer } from "../services/workman/workman.mailer.service";
import { CompanyRefreshTokenDto } from "../dtos/company/company.refresh.token.dto";
import { JwtDataDto } from "../dtos/auth/jwt.data.dto";
import { RefreshInfoDto } from "../dtos/auth/refresh.info.dto";
import { LoginAdministratorDto } from "../dtos/auth/login.administrator.dto";
import { AdministratorService } from "../services/administrator/administrator.service";
import { LoginAdministratorInfoDto } from "../dtos/auth/login.administrator.info.dto";
import { Roles } from "../misc/roles.descriptor";
import { RoleCheckedGuard } from "../misc/role.checked.guard";
import { AdministratorRefreshTokenDto } from "../dtos/administrator/administrator.refresh.token.dto";


@Controller("auth") 
export class AuthController{

    constructor(
        private readonly workmanService:WorkmanService,
        private readonly companyService:CompanyService,
        private readonly companyMailer:CompanyMailer,
        private readonly workmanMailer:WorkmanMailer,
        private readonly administratorService:AdministratorService
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
    
    @Post("workman/login")
    async  workmanLogin(@Body() data:LoginWorkmanDto,@Req() req:Request){
        
        const company= await this.companyService.getByCompanyName(data.companyName);
        if(!company)
            return new ApiResponse("error",-1002);

        const crypto=require("crypto");
        const passwordHash=crypto.createHash("sha512");
        passwordHash.update(data.password);
        const passwordHashString=passwordHash.digest("hex").toUpperCase();

        if(passwordHashString!==company.passwordHash)
            return new ApiResponse("error",-3002);

        const workman = await this.workmanService.getByEmail(data.email);
        if(!workman)
            return new ApiResponse("error",-2002);
    
        if(company.companyId!==workman.companyId)
            return new ApiResponse("error",-2002);

        if(workman.isValid[0]===0)
            return new ApiResponse("error",-3003)
        
        const jwtRefreshData=new JwtRefreshDataDto();
        jwtRefreshData.role="workman";
        jwtRefreshData.identity=workman.email;
        jwtRefreshData.id=workman.workmanId;
        jwtRefreshData.companyId=workman.companyId;
        jwtRefreshData.ip=req.ip.toString();
        jwtRefreshData.ua=req.headers["user-agent"];

        let currentTime=new Date();
        currentTime.setDate(currentTime.getDate()+14);
        const expires=currentTime.getTime()/1000;

        jwtRefreshData.exp=expires;

        const refresToken=jwt.sign(jwtRefreshData.toPlain(),jwtRefreshSecret);

        const newCompanyToken=await this.companyService.addToken(refresToken,company.companyId,workman.workmanId,currentTime);

        const loginInfo=new LoginWorkmanInfoDto();
        loginInfo.refreshToken=refresToken;

        const jwtValidationData:JwtDataCompanyTokenValidation=new JwtDataCompanyTokenValidation();
        jwtValidationData.companyTokenId=newCompanyToken.companyTokenId;
        jwtValidationData.workmanId=workman.workmanId;

        const validationTokenExp=new Date();
        validationTokenExp.setMinutes(validationTokenExp.getMinutes()+2);

        jwtValidationData.exp=validationTokenExp.getTime()/1000;

        const validationToken=jwt.sign(jwtValidationData.toPlain(),jwtTokenValidationSecret)

        this.companyMailer.sendValidationEmail(validationToken,data.email);
        
        return loginInfo;

    }
    @Get("validateCompanyToken/:token")
    async validateCompanyToken(@Param("token") token:string){
        let jwtData:JwtDataCompanyTokenValidation;

        try{
            jwtData=jwt.verify(token,jwtTokenValidationSecret);
        }catch(e){
            return new ApiResponse("error",-3005,"Vrijeme za validaciju je isteklo!");
        }
       
        
        if(!jwtData.companyTokenId || !jwtData.exp || !jwtData.workmanId)
            return new ApiResponse("error",-3006);

        await this.companyService.invalidateTokens(jwtData.workmanId);

        return await this.companyService.validateToken(jwtData.companyTokenId);
    }
    @Post("workman/register")
    async newWorkman(@Body() data:AddWorkmanDto){
        const company=await this.companyService.getByCompanyName(data.companyName);
        if(!company)
            return new ApiResponse("error",-1002,"");

        const crypto=require("crypto");
        const passwordHash=crypto.createHash("sha512");
        passwordHash.update(data.password);
        const passwordHashString=passwordHash.digest("hex").toUpperCase();

    
        if(passwordHashString!==company.passwordHash)
            return new ApiResponse("error",-1003);

        const newWorkman:Workman=await this.workmanService.registerNew(data,company.companyId);
        if(!newWorkman)
            return new ApiResponse("error",-1004);

        const jwtData:JwtDataWorkmanValidationDto=new JwtDataWorkmanValidationDto(newWorkman.workmanId);
        
        let token=jwt.sign(jwtData.toPlainObject(),jwtValidationSecret);
        
        this.workmanMailer.sendValidationEmail(token,newWorkman.email)

        return newWorkman;
    }
    @Get("validateWorkman/:token")
    async validateWorkman(@Param("token") token:string){
        let jwtData:JwtDataWorkmanValidationDto;

        try{
            jwtData=jwt.verify(token,jwtValidationSecret);
        }catch(e){
            return new ApiResponse("error",-1005);
        }
        if(!jwtData || !jwtData.workmanId)
            return new ApiResponse("error",-1005);

        return await this.workmanService.validateWorkman(jwtData.workmanId)
    }


    @Post("workman/refresh")
    async refreshCompanyToken(@Body() data:CompanyRefreshTokenDto,@Req() req:Request){
        const token=await this.companyService.getCompanyToken(data.refreshToken);

        if(!token)
            return new ApiResponse("error",3010,"Token ne postoji!");

        if(token.isValid[0]===0)
            return new ApiResponse("error",3011,"Token nije validan!");

        const workman=await this.workmanService.getValidById(token.workmanId);

        if(!workman)
            return new ApiResponse("error",3012,"Nepostojeci radnik!");
        
        const expTime=token.expiresAt.getTime();
        const currentTime=new Date().getTime();

        if(expTime < currentTime)
            return new ApiResponse("error",-3013,"Isteklo vazenje tokena!");

        let jwtRefreshData:JwtRefreshDataDto;

        try{
            jwtRefreshData=jwt.verify(data.refreshToken,jwtRefreshSecret);
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
        jwtData.role="workman";
        jwtData.id=jwtRefreshData.id;
        jwtData.identity=jwtRefreshData.identity;
        jwtData.companyId=jwtRefreshData.companyId;
        jwtData.ip=jwtRefreshData.ip;
        jwtData.ua=jwtRefreshData.ua;

        const expAt=new Date();
        expAt.setMinutes(expAt.getMinutes()+5);

        jwtData.exp=expAt.getTime()/1000;

        const newToken=jwt.sign(jwtData.toPlain(),jwtSecret);

        const refreshInfo:RefreshInfoDto={
            token:newToken,
            refreshToken:data.refreshToken
        };

        return refreshInfo;
    }

    @UseGuards(RoleCheckedGuard)
    @Roles("workman")
    @Get("workman/tokenCheck")
    workmanTokenCheck(){
        return new ApiResponse("ok",1000);
    }

    @Post("administrator/refresh")
    async refreshAdminToken(@Body() data:AdministratorRefreshTokenDto,@Req() req:Request){
        const token=await this.administratorService.getAdminToken(data.refreshToken);

        if(!token)
            return new ApiResponse("error",3010,"Token ne postoji!");

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
            jwtRefreshData=jwt.verify(data.refreshToken,jwtRefreshSecret);
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
        jwtData.companyId=jwtRefreshData.companyId;
        jwtData.ip=jwtRefreshData.ip;
        jwtData.ua=jwtRefreshData.ua;

        const expAt=new Date();
        expAt.setMinutes(expAt.getMinutes()+5);

        jwtData.exp=expAt.getTime()/1000;

        const newToken=jwt.sign(jwtData.toPlain(),jwtSecret);

        const refreshInfo:RefreshInfoDto={
            token:newToken,
            refreshToken:data.refreshToken
        };

        return refreshInfo;
    }

}