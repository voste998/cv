import { SetMetadata } from "@nestjs/common"
export const Roles=(...roles:("administrator"|"user")[])=>{
    return SetMetadata("roles",roles);
}