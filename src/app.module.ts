import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceService } from './finance/finance.service';
import { FinanceController } from './finance/finance.controller';

@Module({
  imports: [],
  controllers: [AppController, FinanceController],
  providers: [AppService, FinanceService],
})
export class AppModule {}
