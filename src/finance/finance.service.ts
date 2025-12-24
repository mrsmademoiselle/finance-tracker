import { Injectable } from '@nestjs/common'

import { CsvColumnMappings } from 'src/common/common.dto'
import { CsvParserService } from 'src/csv-parser/csv-parser.service'
import {
    ExecutionTypeWithAmounts,
    TopSpendingCategoryForMonth,
    AmountPerWeekday,
    BankStatement,
} from './finance.model'
@Injectable()
export class FinanceService {
    constructor(private csvParserService: CsvParserService) {}

    overrideCsvColumnNames(
        fileName: string,
        csvColumnMappings: CsvColumnMappings
    ) {
        this.csvParserService.overrideCsvColumnNames(
            fileName,
            csvColumnMappings
        )
    }
    getExecutionTypesWithAmounts(
        fileName: string
    ): ExecutionTypeWithAmounts[] | null {
        const bank_statements = this.csvParserService.parseCSVData(fileName)

        if (
            !bank_statements.some((s) => s.transaction_type && s.amount != null)
        ) {
            console.warn(
                'Required fields transaction_type or amount are missing'
            )
            return null
        }

        const executionTypeTotals: { [key: string]: number } = {}

        bank_statements.forEach((statement) => {
            if (!statement.transaction_type || statement.amount == null) return
            executionTypeTotals[statement.transaction_type] =
                (executionTypeTotals[statement.transaction_type] || 0) +
                statement.amount
        })

        return Object.entries(executionTypeTotals).map(
            ([transaction_type, totalAmount]) => ({
                transaction_type,
                totalAmount,
            })
        )
    }
    getTopSpendingCategoriesForMonth(
        fileName: string,
        top: number,
        month: number,
        year: number
    ): TopSpendingCategoryForMonth[] | null {
        const bank_statements = this.csvParserService.parseCSVData(fileName)

        if (
            !bank_statements.some(
                (s) => s.date && s.amount != null && s.category
            )
        ) {
            console.warn('Required fields date, amount or category are missing')
            return null
        }

        const filteredStatements = bank_statements.filter(
            (s) =>
                s.date &&
                s.amount != null &&
                s.category &&
                s.date.getMonth() + 1 === month &&
                s.date.getFullYear() === year &&
                s.amount < 0
        )

        const categoryTotals: { [key: string]: number } = {}
        filteredStatements.forEach((s) => {
            if (!s.category || s.amount == null) return
            categoryTotals[s.category] =
                (categoryTotals[s.category] || 0) + Math.abs(s.amount)
        })

        const sortedCategories = Object.entries(categoryTotals)
            .map(([category, totalAmount]) => ({ category, totalAmount }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, top)

        return sortedCategories
    }
    getMostAmountSpentPerWeekday(fileName: string): AmountPerWeekday[] {
        const bank_statements = this.csvParserService.parseCSVData(fileName)
        return this.getAmountsPerWeekday(bank_statements)
    }

    getHighestSpendingDay(fileName: string): AmountPerWeekday | null {
        const amountPerWeekdays = this.getMostAmountSpentPerWeekday(fileName)
        if (amountPerWeekdays.length === 0) return null

        return amountPerWeekdays.reduce((prev, curr) =>
            curr.totalAmount > prev.totalAmount ? curr : prev
        )
    }

    private getAmountsPerWeekday(
        bank_statements: BankStatement[]
    ): AmountPerWeekday[] {
        const validStatements = bank_statements.filter(
            (s) => s.date && s.amount != null
        )
        if (validStatements.length === 0) return []

        const amountsMap: { [key: string]: number } = {}

        validStatements.forEach((s) => {
            const weekday = s.date!.toLocaleDateString('en-GB', {
                weekday: 'long',
            })
            amountsMap[weekday] = (amountsMap[weekday] || 0) + s.amount!
        })

        return Object.entries(amountsMap).map(([weekday, totalAmount]) => ({
            weekday,
            totalAmount,
        }))
    }
}
