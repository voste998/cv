import { SetMetadata } from "@nestjs/common"
export const Roles=(...roles:("administrator"|"workman")[])=>{
    return SetMetadata("roles",roles);
}