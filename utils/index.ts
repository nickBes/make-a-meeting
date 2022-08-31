const MS_IN_DAYS = 1000 * 60 * 60 * 24

export function dateToDays(date: Date): number {
    return Math.round(date.getTime() / MS_IN_DAYS)
}