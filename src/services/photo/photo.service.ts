import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Photo } from "../../entities/photo.entity";
import { Repository } from "typeorm";
import * as fs from "fs";
import { StorageConfiguration } from "../../../config/storage.configuration";


@Injectable()
export class PhotoService{
    constructor(
        @InjectRepository(Photo) private readonly photo:Repository<Photo>
    ){}

    async newPhoto(mealId:number,filename:string){

        const photo=await this.photo.findOne({
            where:{
                mealId:mealId
            }
        });
        

        if(photo instanceof Photo)
            await this.delete(photo.imagePath);
            

        const newPhoto=new Photo();
        newPhoto.mealId=mealId;
        newPhoto.imagePath=filename;
        

        return await this.photo.save(newPhoto);

    }

    async delete(imagePath:string){
        
        try{
            fs.unlinkSync(StorageConfiguration.photo.destination+"/edited/"+imagePath);
            fs.unlinkSync(StorageConfiguration.photo.destination+"/"+imagePath);
        }catch(e){}

        return await this.photo.delete({
            imagePath:imagePath
        });

    }
}