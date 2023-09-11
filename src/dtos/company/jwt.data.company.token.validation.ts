export class JwtDataCompanyTokenValidation{
    companyTokenId:number;
    workmanId:number;
    exp:number;

    toPlain(){
        return {
            companyTokenId:this.companyTokenId,
            workmanId:this.workmanId,
            exp:this.exp
        };
    }
}