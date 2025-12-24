import { BankStatement } from 'src/finance/finance.model'

export type CsvColumnMappings = Partial<{
    [K in keyof BankStatement]?: string
}>
