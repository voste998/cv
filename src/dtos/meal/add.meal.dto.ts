import { AddMealComponentDto } from "./add.meal.component.dto";


export class AddMealDto{
    name:string;
    offer:"constant"|"exchangeable";
    day:"0"|"1"|"2"|"3"|"4"|"5"|"6";
    mealComponents:AddMealComponentDto[];
    description:string;
}