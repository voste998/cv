import { Injectable , CanActivate ,ExecutionContext} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
@Injectable()
export class RoleCheckedGuard implements CanActivate{

    constructor(
        private reflector:Reflector
    ){}

    canActivate(context:ExecutionContext):boolean|Promise<boolean>|Observable<boolean>{
        const req:Request=context.switchToHttp().getRequest();

        const roles=this.reflector.
                    get<("administrator"|"user")[]>("roles",context.getHandler());
        
        return roles.includes(req.token.role);
    }
}