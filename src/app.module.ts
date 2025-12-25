import { Module, OnApplicationBootstrap } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { CsvParserService } from './csv-parser/csv-parser.service.js'
import { FinanceController } from './finance/finance.controller.js'
import { FinanceService } from './finance/finance.service.js'

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
