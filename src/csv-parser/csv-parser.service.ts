import { Injectable } from '@nestjs/common'
import { readFileSync, writeFileSync } from 'fs'
import { CsvColumnMappings } from 'src/common/common.dto'
import { isValidDate } from 'src/common/helpers/date.helper'
import { BankStatement } from 'src/finance/finance.model'
@Injectable()
export class CsvParserService {
    overrideCsvColumnNames(
        fileName: string,
        csvColumnMapping: CsvColumnMappings
    ) {
        const rows = readFileSync(fileName, 'utf-8').split(/\r?\n/)
        const headers = rows[0].split(';').map((cell) => cell.trim())

        console.log('Original headers:', headers)
        const updatedHeaders = headers.map((header) =>
            this.getColumnMappingFieldNameForValue(header, csvColumnMapping)
        )
        console.log('Updated headers:', updatedHeaders)

        rows[0] = updatedHeaders.join(';')

        writeFileSync(fileName, rows.join('\r\n'), 'utf-8')
        return rows.join('\r')
    }

    getColumnMappingFieldNameForValue(
        value: string,
        csvColumnMapping: CsvColumnMappings
    ) {
        const trimmed = value.trim()

        for (const [fieldName, mappedValue] of Object.entries(
            csvColumnMapping
        )) {
            if (mappedValue && mappedValue.trim() === trimmed) {
                return fieldName
            }
        }
        return value
    }

    parseCSVData(fileName: string): BankStatement[] {
        const rows = readFileSync(fileName, 'utf-8').split(/\r?\n/)
        const headers = rows[0].split(';').map((h) => h.trim())
        const dataRows = rows.slice(1) // remove header row

        return dataRows
            .map((row) => this.getDataFromRowPartial(row, headers))
            .filter(
                (statement): statement is BankStatement => statement !== null
            )
    }

    /**
     * Parse a row to BankStatement allowing partial/missing data.
     */
    getDataFromRowPartial(
        row: string,
        headers: string[]
    ): BankStatement | null {
        if (!row?.trim()) {
            console.warn('Found empty row - skipping')
            return null
        }

        const rowData = row.split(';').map((cell) => cell.trim())
        const statement = this.validateHeaders(headers, rowData)
        return statement
    }

    validateHeaders(headers: string[], rowData: string[]): BankStatement {
        const statement: BankStatement = {}

        headers.forEach((header, index) => {
            const value = rowData[index]
            if (!value) return // leave undefined if missing

            switch (header) {
                case 'date': {
                    const parsedDate = new Date(value)
                    if (isValidDate(parsedDate)) statement.date = parsedDate
                    break
                }
                case 'date_executed': {
                    const parsedDateExecuted = new Date(value)
                    if (isValidDate(parsedDateExecuted))
                        statement.date_executed = parsedDateExecuted
                    break
                }
                case 'amount': {
                    const parsedAmount = parseFloat(value)
                    if (!isNaN(parsedAmount)) statement.amount = parsedAmount
                    break
                }
                case 'transaction_type':
                case 'text':
                case 'currency':
                case 'bank_number_owner':
                case 'category':
                    statement[header] = value
                    break
            }
        })

        return statement
    }
}
