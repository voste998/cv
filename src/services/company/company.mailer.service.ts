import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CompanyMailer{
    constructor(
        private readonly mailerService:MailerService
    ){}

    sendValidationEmail(token:string,email:string){
        this.mailerService.sendMail({
            to:email,
            subject:"Validacija tokena",
            encoding:"UTF-8",
            replyTo:"no-replay@domain.com",
            html:this.makeValidationHtml(token)
        })
    }

    makeValidationHtml(token:string){
        return"<div>"+
        "<h5>Neko se pokusao ulogovati na ketering aplikaciju koristevi vasu email adresu!<br/>"+
        "Pritisnite dugme da bi potvrdili da ste to vi."+
        "</h5>"+
        '<a style="text-align:center;border-radius:10px;color:white;background:cadetblue;padding:10px;"'+ 
        'href="http://localhost:3000/auth/validateCompanyToken/'+token+'">Potvrdi</a>'+
        "</div>";
    }
}