import { Controller , Post ,Body, Delete, Param, UseGuards,UseInterceptors ,Req, UploadedFile} from "@nestjs/common";
import { MealService } from "../services/meal/meal.service";
import { AddMealDto } from "../dtos/meal/add.meal.dto";
import ApiResponse from "../misc/api.response.class";
import { Meal } from "../entities/meal.entity";
import { Roles } from "../misc/roles.descriptor";
import { RoleCheckedGuard } from "../misc/role.checked.guard";
import { StorageConfiguration } from "../../config/storage.configuration";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { Photo } from "../entities/photo.entity";
import { Request } from "express";
import { PhotoService } from "../services/photo/photo.service";
import filetype from "magic-bytes.js";
import * as fs from "fs";
import * as sharp from "sharp";


@Controller("api/meal")
export class MealController{
    constructor(
        private readonly mealService:MealService,
        private readonly photoService:PhotoService
    ){}

    @UseGuards(RoleCheckedGuard)
    @Roles("administrator")
    @Post("newMeal")
    async newMeal(@Body() data:AddMealDto):Promise<Meal|ApiResponse>{
        return await this.mealService.newMeal(data);
    }

    @UseGuards(RoleCheckedGuard)
    @Roles("administrator")
    @Delete("deleteFull/:mealId")
    async deleteFull(@Param("mealId") mealId:number){
        return await this.mealService.deleteFull(mealId);
    }



    @Post(":id/uploadPhoto")
    @UseInterceptors(
        FileInterceptor("photo",{
            fileFilter:(req,file,callback)=>{
                if(!file.originalname.match(/\.(jpg|png)$/)){
                    callback(null,false);
                    req.errorMessage="Ekstenzija fajla mora biti jpg ili png";
                    return;
                }
                
                callback(null,true);
                return;
            },
            storage:diskStorage({
                destination:StorageConfiguration.photo.destination,
                filename:(req,file,callback)=>{
                    const newFilename:string=StorageConfiguration.photo.photoNameGenerator(file.originalname);
                    callback(null,newFilename);
                    
                }
            }),
            limits:{
                files:1
            }
        })
    )
    async uploadPhoto(@Param("id") mealId:number,@UploadedFile() photo,@Req() req:Request):Promise<ApiResponse|Photo>{
        if(req.errorMessage)
            return new ApiResponse("error",-6004,req.errorMessage);

        if(!photo)
            return new ApiResponse("error",-6005);
        
       
           
        
        try{
            const savedPhoto=fs.readFileSync(photo.path);
            const mimetype=filetype(savedPhoto)[0]?.mime;
            
            if(mimetype!=="image/jpeg" && mimetype!=="image/png"){
                fs.unlinkSync(photo.path);
                return new ApiResponse("error",-6006);
            }
                
            
        }catch(e){
            fs.unlinkSync(photo.path);
            return new ApiResponse("error",-6007);
        }
        
        const newPhoto:Photo|ApiResponse= await this.photoService.newPhoto(mealId,photo.filename);
        if(newPhoto instanceof ApiResponse){
            fs.unlinkSync(photo.path);
            return newPhoto;
        }

        await this.createEdited(photo);

        return newPhoto ;
    }
    async createEdited(photo){
        
        const originalPath=photo.path;
        const filename=photo.filename;
        const thumbPhotoDest=StorageConfiguration.photo.destination+"/edited/"+filename;
        
        fs.readFile(originalPath,async (err,data)=>{
            if(!err)
            await sharp(data).resize({
                height:StorageConfiguration.photo.editedPhotoSize.height,
                width:StorageConfiguration.photo.editedPhotoSize.width,
                fit:"cover"
            }).toFile(thumbPhotoDest);
        });
       
    }
    
}