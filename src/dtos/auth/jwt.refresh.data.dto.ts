export class JwtRefreshDataDto{
    role:"administrator"|"workman";
    id:number;
    identity:string;
    companyId?:number;
    exp:number;
    ip:string;
    ua:string;

    toPlain(){
        const jwtRefreshData= {
            role:this.role,
            id:this.id,
            identity:this.identity,
            exp:this.exp,
            ip:this.ip,
            ua:this.ua
        }
        if(!this.companyId)
            return jwtRefreshData;

        return {...jwtRefreshData,companyId:this.companyId};
    }
}