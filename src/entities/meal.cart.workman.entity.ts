import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
    name:"meal_cart_workman"
})
export class MealCartWorkman{
    @ViewColumn({name:"meal_id"})
    mealId:number;

    @ViewColumn({name:"name"})
    name:string;

    @ViewColumn({name:"day"})
    day:"0"|"1"|"2"|"3"|"4"|"5"|"6";
    
    @ViewColumn({name:"company_id"})
    companyId:number;

    @ViewColumn({name:"workman_id"})
    workmanId:number;

    @ViewColumn({name:"status"})
    status:"next"|"current"

}
  