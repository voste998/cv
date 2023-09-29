
export class AddCompanyDto{
    name:string;
    password:string;
    workpeople:number;
    days:("0"|"1"|"2"|"3"|"4"|"5"|"6")[];
    address:string;
}