import { Injectable } from "@nestjs/common";
import { UserSessionService } from "./user.session.setvice";

@Injectable()
export class SessionCleanerService {
  constructor(private readonly userSessionService: UserSessionService) {
    console.log("called")
    this.startInactiveSessionCheck();
  }

  private startInactiveSessionCheck() {
    setInterval(async () => {
      await this.userSessionService.checkInactiveSessions();
    }, 5 * 60 * 1000); 
  }
}