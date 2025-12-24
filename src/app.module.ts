import { Module, OnApplicationBootstrap } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { FinanceService } from './finance/finance.service'
import { FinanceController } from './finance/finance.controller'
import { MulterModule } from '@nestjs/platform-express'
import { CsvParserService } from './csv-parser/csv-parser.service'
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [
        ConfigModule.forRoot(),
        MulterModule.register({
            dest:
                process.env.CSV_FILE_UPLOAD_DESTINATION || './data/uploads/csv',
        }),
    ],
    controllers: [AppController, FinanceController],
    providers: [AppService, FinanceService, CsvParserService],
})
export class AppModule implements OnApplicationBootstrap {
    onApplicationBootstrap() {
        const filename = `${process.env.CSV_FILE_UPLOAD_DESTINATION}/bank_statements.csv`
        const financeService = new FinanceService(new CsvParserService())
        console.log(financeService.getMostAmountSpentPerWeekday(filename))
        console.log(financeService.getHighestSpendingDay(filename))
        console.log(
            financeService.getTopSpendingCategoriesForMonth(
                filename,
                3,
                5,
                2024
            )
        )
        console.log(financeService.getExecutionTypesWithAmounts(filename))
    }
}
