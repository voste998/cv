import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddCompanyDto } from "../../dtos/company/add.company.dto";
import EditCompanyDto from "../../dtos/company/edit.company.dto";
import { CompanyDay } from "../../entities/company.day.entity";
import { Company } from "../../entities/company.entity";
import ApiResponse from "../../misc/api.response.class";
import { Repository } from "typeorm";
import { CompanyToken } from "../../entities/company.token.entity";

@Injectable()
export class CompanyService{
    constructor(
        @InjectRepository(Company) private readonly company:Repository<Company>,
        @InjectRepository(CompanyDay) private readonly companyDay:Repository<CompanyDay>,
        @InjectRepository(CompanyToken) private readonly companyToken:Repository<CompanyToken>
    ){}
    
    async createNewCompany(data:AddCompanyDto):Promise<Company>{
        const crypto=require("crypto");
        const passwordHash=crypto.createHash("sha512");
        passwordHash.update(data.password);
        const passwordHashString=passwordHash.digest("hex").toUpperCase();
        
        const newCompany=new Company();
        newCompany.name=data.name;
        newCompany.passwordHash=passwordHashString;
        newCompany.workpeople=data.workpeople;
        
        const savedCompany=await this.company.save(newCompany);
        for(let day of data.days){
            let newDay=new CompanyDay();
            newDay.companyId=savedCompany.companyId;
            newDay.day=day;
            await this.companyDay.save(newDay);
        }
        return savedCompany;
    }

    async editCompany(companyId:number,data:EditCompanyDto):Promise<Company|ApiResponse>{
        const company=await this.company.findOne({
            where:{
                companyId:companyId
            }
        });
        if(!company)
            return new ApiResponse("error",-1001);

        const days=await this.companyDay.find({
            where:{
                companyId:companyId
            }
        });

        await this.companyDay.remove(days);
        
        for(let day of data.days){
            let newDay=new CompanyDay();
            newDay.companyId=company.companyId;
            newDay.day=day;
            await this.companyDay.save(newDay);
        }
        
        const crypto=require("crypto");
        const passwordHash=crypto.createHash("sha512");
        passwordHash.update(data.password);
        const passwordHashString=passwordHash.digest("hex").toUpperCase();
        
        

        company.passwordHash=passwordHashString;
        company.name=data.name;
        company.workpeople=data.workpeople;

        return await this.company.save(company);
        

    }

    async getByCompanyName(companyName:string):Promise<Company>{
        return await this.company.findOne({
            where:{
                name:companyName
            }
        });
    }

    async addToken(token:string,companyId:number,workmanId:number,expiresAt:Date){
        const newToken=new CompanyToken();
        newToken.companyId=companyId;
        newToken.workmanId=workmanId;
        newToken.token=token;
        newToken.expiresAt=expiresAt;
        return await this.companyToken.save(newToken);
    }

    async invalidateTokens(workmanId:number){
        const tokens=await this.companyToken.find({
            where:{
                workmanId:workmanId,
                isValid:true
            }
        });
        
        for(let token of tokens){
            token.isValid=false;
            await this.companyToken.save(token);
        }

    }

    async validateToken(comapnyTokenId:number){
        const token=await this.companyToken.findOne({
            where:{
                companyTokenId:comapnyTokenId
            }
        });

        token.isValid=true;
        
        return await this.companyToken.save(token);

    }

    async getCompanyToken(token:string):Promise<CompanyToken>{
        return await this.companyToken.findOne({
            where:{
                token:token
            }
        });
    }

} 