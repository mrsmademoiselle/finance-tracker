export type CsvColumnMappings = Partial<{
    [K in keyof BankStatement]?: string
}>

export interface AmountPerWeekday {
    weekday: string
    totalAmount: number
}
export interface BankStatement {
    date?: Date
    date_executed?: Date
    transaction_type?: string
    text?: string
    amount?: number
    currency?: string
    bank_number_owner?: string
    category?: string
}
export interface ExecutionTypeWithAmounts {
    transaction_type: string
    totalAmount: number
}

export interface TopSpendingCategoryForMonth {
    category: string
    totalAmount: number
}
