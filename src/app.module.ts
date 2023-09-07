import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from './config/database.configuration';
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
    ])
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
