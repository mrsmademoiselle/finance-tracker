import { BankStatement } from '../common.dto'
import { isValidDate } from './date.helper'

/**
 * Maps a generic CSV row to a BankStatement.
 */
export function mapRowToBankStatement(
    row: Record<string, string>
): BankStatement {
    const statement: BankStatement = {}

    if (row.date) {
        const parsed = new Date(row.date)
        if (isValidDate(parsed)) statement.date = parsed
    }

    if (row.date_executed) {
        const parsed = new Date(row.date_executed)
        if (isValidDate(parsed)) statement.date_executed = parsed
    }

    if (row.amount) {
        const parsed = parseFloat(row.amount)
        if (!isNaN(parsed)) statement.amount = parsed
    }

    if (row.transaction_type) statement.transaction_type = row.transaction_type
    if (row.text) statement.text = row.text
    if (row.currency) statement.currency = row.currency
    if (row.bank_number_owner)
        statement.bank_number_owner = row.bank_number_owner
    if (row.category) statement.category = row.category

    return statement
}
