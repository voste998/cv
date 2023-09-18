import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Workman } from "../../entities/workman.entity";
import { Repository } from "typeorm";
import { Company } from "../../entities/company.entity";
import { AddWorkmanDto } from "../../dtos/workman/add.workman.dto";
import ApiResponse from "../../misc/api.response.class";

@Injectable()
export class WorkmanService{
    constructor(
        @InjectRepository(Workman) private readonly workman:Repository<Workman>,
        @InjectRepository(Company) private readonly company:Repository<Company>
    ){}

    async registerNew(data:AddWorkmanDto,companyId:number):Promise<Workman>{

        const newWorkman:Workman=new Workman();
        newWorkman.email=data.email;
        newWorkman.name=data.name;
        newWorkman.lastname=data.lastname;
        newWorkman.companyId=companyId;

        return await this.workman.save(newWorkman);
    }

    async validateWorkman(workmanId:number){
        const workman=await this.workman.findOne({
            where:{
                workmanId:workmanId
            }
        });
        if(!workman)
            return new ApiResponse("error",-2001);

        workman.isValid=true;

        return this.workman.save(workman);
    }
    
    async getByEmail(email:string){
        return await this.workman.findOne({
            where:{
                email:email
            }
        })
    }

    async getValidById(id:number):Promise<Workman>{
        return await this.workman.findOne({
            where:{
                workmanId:id,
                isValid:true
            }
        });
    }
}