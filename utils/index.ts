
const MS_IN_DAYS = 1000 * 60 * 60 * 24

interface AttendanceMap {
    attendance: number[]
    offset: number
}

export function zeroedArr(len: number): number[] {
    return (new Array(len)).fill(0)
}

export function dateToDays(date: Date): number {
    return Math.round(date.getTime() / MS_IN_DAYS)
}

export function daysToDate(days: number): Date {
    return new Date(days * MS_IN_DAYS)
}

export function attendanceFromRanges(ranges: {
    start: number;
    end: number;
}[]): AttendanceMap {
    const rangesLength = ranges.length

    if (rangesLength == 0) {
        return {
            attendance: [],
            offset: 0
        }
    }

    // end always bigger then start
    // hence the min will always be a start
    // and the max will always be the end
    let min = ranges[0].start
    let max = ranges[0].end

    for (let i = 1; i < rangesLength; i++) {
        const { start, end } = ranges[i]

        if (min > start) {
            min = start
        }

        if (max < end) {
            max = end
        }
    }

    // adding 1 to include the last value
    const attendanceLength = max - min + 1

    let start = zeroedArr(attendanceLength)
    let end = zeroedArr(attendanceLength)
    let attendance = zeroedArr(attendanceLength)

    ranges.forEach(range => {
        start[range.start - min]++
        end[range.end - min]++
    })

    // inc represents the depth inside date ranges
    // which is equivalent to the attendance at day i
    let inc = attendance[0] = start[0]

    for (let i = 1; i < attendanceLength; i++) {
        inc += start[i]
        inc -= end[i - 1]

        attendance[i] = inc
    }

    return { attendance, offset: min }
}