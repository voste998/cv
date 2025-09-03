import {  Injectable } from "@nestjs/common";
import { UserSessionService } from "./user.session.service";
import {Server} from "socket.io";



@Injectable()
export class SessionCleanerService {

  private server:Server;

  constructor(private readonly userSessionService: UserSessionService,
  ) {}

  public setServer(server:Server){
    this.server=server;
    this.startInactiveSessionCheck();
  }

  private startInactiveSessionCheck() {

    setInterval(async () => {
      const socketIds=await this.userSessionService.checkInactiveSessions();

      for(let id of socketIds){
          if(this.server.sockets.sockets.get(id)){
            this.server.sockets.sockets.get(id)?.disconnect(true);
            //this.userSessionService.removeSocketById(id);
          }else{
            this.userSessionService.removeSocketById(id);
          }
          
          
      }

    }, 5 * 60 * 1000); 
  }
 

}