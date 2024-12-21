export class JwtRefreshDataDto{
    role:"administrator"|"user";
    id:number;
    identity:string;
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

        return jwtRefreshData;
    }
}