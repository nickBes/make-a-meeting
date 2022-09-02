// import { DateRange } from "@prisma/client"

const MS_IN_DAYS = 1000 * 60 * 60 * 24

function zeroedArr(len: number): number[] {
    return (new Array(len)).fill(0)
}

export function dateToDays(date: Date): number {
    return Math.round(date.getTime() / MS_IN_DAYS)
}



export function attendanceFromRanges(ranges: { start: number, end: number }[]): {
    attendance: number[],
    offset: number
} {
    const rangesLength = ranges.length

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

    let inc = attendance[0] = start[0]

    for (let i = 1; i < attendanceLength; i++) {
        inc += start[i]
        inc -= end[i - 1]

        attendance[i] = inc
    }

    return { attendance, offset: min }
}