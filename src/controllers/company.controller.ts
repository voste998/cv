import { Body, Controller, Param, Post , Get } from "@nestjs/common";
import { AddCompanyDto } from "../dtos/company/add.company.dto";
import EditCompanyDto from "../dtos/company/edit.company.dto";
import { CompanyService } from "../services/company/company.service";

import { WorkmanService } from "../services/workman/workman.service";
import { WorkmanMailer } from "../services/workman/workman.mailer.service";

@Controller("api/company")
export class CompanyController{
    constructor(
        private readonly companyService:CompanyService,
        private readonly workmanService:WorkmanService,
        private readonly workmanMailer:WorkmanMailer
    ){}

    @Post("createNew")
    createNew(@Body() data:AddCompanyDto){
        return this.companyService.createNewCompany(data);
    }
    @Post("editFull/:id")
    editFull(@Param("id") id:number,@Body() data:EditCompanyDto){
        return this.companyService.editCompany(id,data);
    }
    @Get("test")
    test(){
        return {
            test:"Poroslo na middleware"
        }
    }
    
    
    
}