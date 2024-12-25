import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from '../config/database.configuration';
import { Administrator } from './entities/administrator.entity';
import { AdministratorToken } from './entities/administrator.token.entity';
import { AuthController } from './controllers/auth.controller';
import { AdministratorController } from './controllers/administrator.controller';
import { AdministratorService } from './services/administrator/administrator.service';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { User } from './entities/user.entity';
import { UserToken } from './entities/user.token.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user/user.service';
import { ChatModule } from './chat/chat.module';
import { MessageService } from './services/message/message.service';
import { Message } from './entities/message.entity';
import {Session} from './entities/session.entity'
import { MessageController } from './controllers/message.controller';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:"mysql",
      port:3306,
      host:DatabaseConfiguration.host,
      database:DatabaseConfiguration.database,
      username:DatabaseConfiguration.username,
      password:DatabaseConfiguration.password,
      entities:[
        Administrator,AdministratorToken,User,UserToken,Message,Session
      ]
    }),TypeOrmModule.forFeature([
      Administrator,AdministratorToken,User,UserToken,Message
    ]), ChatModule,
    
  ],
  controllers: [AuthController,AdministratorController,UserController,MessageController],
  providers: [AdministratorService,UserService,MessageService],
  exports:[AdministratorService,UserService]
}) 
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).
        exclude("api/administrator/createNew","api/user/createNew").
        forRoutes("api/administrator/*","api/user/*","auth/isAuthenticated")
    }
}
