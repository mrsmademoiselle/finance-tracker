import {
    ExecutionTypeWithAmounts,
    TopSpendingCategoryForMonth,
    AmountPerWeekday,
    BankStatement,
} from '../common/common.dto'

/**
 * FinanceAnalyzer performs finance-specific calculations on bank statement data.
 */
export class FinanceAnalyzer {
    constructor(private readonly statements: BankStatement[]) {}

    /**
     * Returns total amounts grouped by transaction type.
     */
    getExecutionTypesWithAmounts(): ExecutionTypeWithAmounts[] | null {
        if (
            !this.statements.some((s) => s.transaction_type && s.amount != null)
        )
            return null

        const totals: Record<string, number> = {}
        for (const s of this.statements) {
            if (!s.transaction_type || s.amount == null) continue
            totals[s.transaction_type] =
                (totals[s.transaction_type] || 0) + s.amount
        }

        return Object.entries(totals).map(
            ([transaction_type, totalAmount]) => ({
                transaction_type,
                totalAmount,
            })
        )
    }

    /**
     * Returns the top spending categories for a specific month and year.
     *
     * @param top - The number of top categories to return (e.g., 3 returns the top 3 categories by spending). Limited by total available categories.
     * @param month - The month for which to calculate top spending (1 = January, 12 = December)
     * @param year - The year for which to calculate top spending (e.g., 2024)
     * @returns Array of TopSpendingCategoryForMonth objects containing `category` and `totalAmount`,
     *          or null if there is no valid data for the specified month/year
     */
    getTopSpendingCategoriesForMonth(
        top: number,
        month: number,
        year: number
    ): TopSpendingCategoryForMonth[] | null {
        const filtered = this.statements.filter(
            (s) =>
                s.date &&
                s.amount != null &&
                s.category &&
                s.date.getMonth() + 1 === month &&
                s.date.getFullYear() === year &&
                s.amount < 0
        )

        if (filtered.length === 0) return null

        const totals: Record<string, number> = {}
        filtered.forEach((s) => {
            totals[s.category!] =
                (totals[s.category!] || 0) + Math.abs(s.amount!)
        })

        return Object.entries(totals)
            .map(([category, totalAmount]) => ({ category, totalAmount }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, top)
    }

    /**
     * Returns total amounts spent per weekday.
     */
    getMostAmountSpentPerWeekday(): AmountPerWeekday[] {
        const valid = this.statements.filter((s) => s.date && s.amount != null)
        if (valid.length === 0) return []

        const map: Record<string, number> = {}
        valid.forEach((s) => {
            const weekday = s.date!.toLocaleDateString('en-GB', {
                weekday: 'long',
            })
            map[weekday] = (map[weekday] || 0) + s.amount!
        })

        return Object.entries(map).map(([weekday, totalAmount]) => ({
            weekday,
            totalAmount,
        }))
    }

    /**
     * Returns the weekday with the highest spending.
     */
    getHighestSpendingDay(): AmountPerWeekday | null {
        const days = this.getMostAmountSpentPerWeekday()
        if (days.length === 0) return null
        return days.reduce((prev, curr) =>
            curr.totalAmount > prev.totalAmount ? curr : prev
        )
    }
}
