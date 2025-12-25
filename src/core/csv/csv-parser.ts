import { readFileSync, writeFileSync } from 'fs'

/**
 * CsvParser is a generic CSV utility for reading, parsing,
 * and optionally remapping headers of CSV files.
 */
export class CsvParser {
    /**
     * Overrides the headers of a CSV file according to the input mapping.
     * Updates the file in place.
     *
     * @param fileName - Path to the CSV file.
     * @param columnMapping - Object mapping original column names to new field names.
     */
    overrideCsvColumnNames(
        fileName: string,
        columnMapping: Record<string, string>
    ): void {
        const rows = readFileSync(fileName, 'utf-8').split(/\r?\n/)
        const headers = rows[0].split(';').map((cell) => cell.trim())

        const updatedHeaders = headers.map((header) =>
            this.getMappedHeader(header, columnMapping)
        )

        rows[0] = updatedHeaders.join(';')
        writeFileSync(fileName, rows.join('\r\n'), 'utf-8')
    }

    /**
     * Parses a CSV file into an array of objects.
     * Each row is represented as a key-value object using headers as keys.
     *
     * @param fileName - Path to the CSV file.
     * @returns Array of objects representing CSV rows.
     */
    parseCSVData(fileName: string): Record<string, string>[] {
        const rows = readFileSync(fileName, 'utf-8').split(/\r?\n/)
        if (!rows.length) return []

        const headers = rows[0].split(';').map((h) => h.trim())

        return rows
            .slice(1)
            .map((row) => this.parseRow(row, headers))
            .filter((row): row is Record<string, string> => row !== null)
    }

    /**
     * Parses a single CSV row into an object.
     * Returns null if the row is empty.
     *
     * @param row - CSV row string
     * @param headers - Array of header names
     */
    private parseRow(
        row: string,
        headers: string[]
    ): Record<string, string> | null {
        if (!row?.trim()) return null

        const rowData = row.split(';').map((cell) => cell.trim())
        const obj: Record<string, string> = {}

        headers.forEach((header, index) => {
            const value = rowData[index]
            if (value !== undefined) obj[header] = value
        })

        return obj
    }

    /**
     * Maps a header value to a new field name if provided in mapping.
     *
     * @param header - Original CSV header
     * @param columnMapping - Object mapping original names to new names
     */
    private getMappedHeader(
        header: string,
        columnMapping: Record<string, string>
    ): string {
        const trimmed = header.trim()
        return (
            Object.entries(columnMapping).find(
                ([, mapped]) => mapped?.trim() === trimmed
            )?.[0] ?? header
        )
    }
}
