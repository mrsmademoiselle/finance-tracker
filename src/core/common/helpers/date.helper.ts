export function isValidDate(value: Date): boolean {
    const date = new Date(value)
    return !isNaN(date.getTime())
}
