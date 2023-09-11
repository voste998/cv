
export class JwtDataWorkmanValidationDto{
    workmanId:number;
    constructor(workmanId:number){
        this.workmanId=workmanId;
    }
    
    toPlainObject(){
        return {
            workmanId:this.workmanId
        }
    };
}