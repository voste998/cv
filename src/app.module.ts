import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from '../config/database.configuration';
import { Administrator } from './entities/administrator.entity';
import { AdministratorToken } from './entities/administrator.token.entity';
import { Cart } from './entities/cart.entity';
import { CompanyDay } from './entities/company.day.entity';
import { Company } from './entities/company.entity';
import { CompanyToken } from './entities/company.token.entity';
import { Component } from './entities/component.entity';
import { MealCart } from './entities/meal.cart.entity';
import { MealComponent } from './entities/meal.component.entity';
import { Meal } from './entities/meal.entity';
import { Photo } from './entities/photo.entity';
import { Workman } from './entities/workman.entity';
import { CompanyController } from './controllers/company.controller';
import { CompanyService } from './services/company/company.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailConfig } from "../config/mail.config";
import { WorkmanService } from './services/workman/workman.service';
import { WorkmanMailer } from './services/workman/workman.mailer.service';
import { AuthController } from './controllers/auth.controller';
import { CompanyMailer } from './services/company/company.mailer.service';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AdministratorService } from './services/administrator/administrator.service';
import { CartControler } from './controllers/cart.controller';
import { CartService } from './services/cart/cart.service';
import { MealService } from './services/meal/meal.service';
import { MealCartWorkman } from './entities/meal.cart.workman.entity';

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
        Administrator,AdministratorToken,Cart,
        CompanyDay,Company,CompanyToken,
        Component,MealCart,MealComponent,
        Meal,Photo,Workman,MealCartWorkman
      ]
    }),TypeOrmModule.forFeature([
      Administrator,AdministratorToken,Cart,
      CompanyDay,Company,CompanyToken,
      Component,MealCart,MealComponent,
      Meal,Photo,Workman,MealCartWorkman
    ]),
    MailerModule.forRoot({
      transport: "smtps://"+MailConfig.username+":"
                           +MailConfig.password+"@"
                           +MailConfig.hostname,
      defaults:{
        from:MailConfig.senderEmail,
      }
    })
  ],
  controllers: [CompanyController,AuthController,CartControler],
  providers: [CompanyService,WorkmanService,WorkmanMailer,CompanyMailer,AdministratorService,CartService,MealService],
  exports:[AdministratorService,WorkmanService]
}) 
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).
        exclude().
        forRoutes("api/company/test","api/cart/*")
    }
}
