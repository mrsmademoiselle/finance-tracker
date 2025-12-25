import { Injectable } from '@nestjs/common'
import { FinanceAnalyzer, BankStatement } from '../core'
import { CsvParserService } from '../csv-parser/csv-parser.service'
import { mapRowToBankStatement } from '../core/common/helpers/finance-mapping.helper'

@Injectable()
export class FinanceService {
    constructor(private readonly csvParser: CsvParserService) {}

    private parseFile(file: string): BankStatement[] {
        const rows = this.csvParser.parseCSVData(file)
        return rows.map(mapRowToBankStatement)
    }

    getExecutionTypesWithAmounts(file: string) {
        const statements = this.parseFile(file)
        const analyzer = new FinanceAnalyzer(statements)
        return analyzer.getExecutionTypesWithAmounts()
    }

    getTopSpendingCategoriesForMonth(
        file: string,
        top: number,
        month: number,
        year: number
    ) {
        const statements = this.parseFile(file)
        const analyzer = new FinanceAnalyzer(statements)
        return analyzer.getTopSpendingCategoriesForMonth(top, month, year)
    }

    getMostAmountSpentPerWeekday(file: string) {
        const statements = this.parseFile(file)
        const analyzer = new FinanceAnalyzer(statements)
        return analyzer.getMostAmountSpentPerWeekday()
    }

    getHighestSpendingDay(file: string) {
        const statements = this.parseFile(file)
        const analyzer = new FinanceAnalyzer(statements)
        return analyzer.getHighestSpendingDay()
    }
}
