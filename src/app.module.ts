import { Module } from '@nestjs/common';
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
        Meal,Photo,Workman
      ]
    }),TypeOrmModule.forFeature([
      Administrator,AdministratorToken,Cart,
      CompanyDay,Company,CompanyToken,
      Component,MealCart,MealComponent,
      Meal,Photo,Workman
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
  controllers: [CompanyController,AuthController],
  providers: [CompanyService,WorkmanService,WorkmanMailer,CompanyMailer],
})
export class AppModule {}
