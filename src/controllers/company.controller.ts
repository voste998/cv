import { Body, Controller, Param, Post , Get, UseGuards } from "@nestjs/common";
import { AddCompanyDto } from "../dtos/company/add.company.dto";
import EditCompanyDto from "../dtos/company/edit.company.dto";
import { CompanyService } from "../services/company/company.service";
import { Roles } from "../misc/roles.descriptor";
import { RoleCheckedGuard } from "../misc/role.checked.guard";


@Controller("api/company")
export class CompanyController{
    constructor(
        private readonly companyService:CompanyService,
        
    ){}
    
    @UseGuards(RoleCheckedGuard)
    @Roles("workman")
    @Post("createNew")
    createNew(@Body() data:AddCompanyDto){
        return this.companyService.createNewCompany(data);
    }

    @UseGuards(RoleCheckedGuard)
    @Roles("administrator")
    @Post("editFull/:id")
    editFull(@Param("id") id:number,@Body() data:EditCompanyDto){
        return this.companyService.editCompany(id,data);
    }

    @UseGuards(RoleCheckedGuard)
    @Roles("administrator")
    @Post("getAll")
    getAll(){
        return this.companyService.getAll();
    }
   
    
    
    
}