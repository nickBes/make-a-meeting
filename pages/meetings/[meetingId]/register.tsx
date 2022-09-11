import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Meeting } from "@prisma/client"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { unstable_getServerSession } from "next-auth"
import { attendanceFromRanges, dateToDays, daysToDate, zeroedArr } from "@/utils"
import prisma from "@/prisma/db"
import React, { useState } from "react"
import { Calendar } from "@mantine/dates"
import { Button, Container, Group, Stack, Text, Title, Card, Divider } from "@mantine/core"
import { useMutation } from "@tanstack/react-query"
import { CreateDateRangeData } from "@/pages/api/range"
import axios from "axios"

export const getServerSideProps: GetServerSideProps<Meeting & {
    dateRanges: {
        id: string;
        start: number;
        end: number;
    }[]
}, { meetingId?: string }>
    = async ({ req, res, params }) => {
        const session = await unstable_getServerSession(req, res, authOptions)

        if (!session?.user?.email) {
            return {
                redirect: {
                    destination: "/",
                    permanent: false
                }
            }
        }

        if (!params?.meetingId) {
            return { notFound: true }
        }

        const meeting = await prisma.meeting.findUnique({
            where: {
                id: params.meetingId
            },
            include: {
                dateRanges: {
                    where: {
                        user: {
                            email: session.user.email
                        }
                    },
                    select: {
                        id: true,
                        start: true,
                        end: true
                    }
                }
            }
        })

        if (!meeting) {
            return { notFound: true }
        }

        return {
            props: meeting
        }
    }

function setsAreEqual<T>(a: Set<T>, b: Set<T>): boolean {
    if (a.size !== b.size) return false

    return Array.from(a).every(val => b.has(val))
}

const Register: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ dateRanges, start, end, id, name }) => {
    function daysFromInitialRanges() {
        const { attendance, offset } = attendanceFromRanges(dateRanges)

        let dates = new Set<number>()
        attendance.forEach((date, index) => {
            if (date != 0) {
                dates.add(index + offset)
            }
        })

        return dates
    }

    const [isLoading, setIsLoading] = useState(false)

    const [initialDays, setInitialDays] = useState(daysFromInitialRanges())

    const [days, setDays] = useState(initialDays)

    const createRangeMutation = useMutation(async (createDateRangeData: CreateDateRangeData) => {
        setIsLoading(true)
        await axios.post<{ rangeId: string }>("/api/range", createDateRangeData)
        setIsLoading(false)
    }, {
        onSuccess: () => {
            setInitialDays(days)
        }
    })

    // translates user data (selected days) into ranges
    function rangesFromDays() {
        let dayArr = Array.from(days)
        if (dayArr.length == 0) return []

        let min = dayArr[0]
        let max = dayArr[0]

        for (let i = 1; i < dayArr.length; i++) {
            const current = dayArr[i]

            if (current < min) {
                min = current
            }

            if (current > max) {
                max = current
            }
        }

        const attendanceLength = max - min + 1
        let attendance = zeroedArr(attendanceLength)
        dayArr.forEach(day => {
            attendance[day - min]++
        })

        let ranges = []

        let start = end = 0

        for (let i = 0; i < attendanceLength - 1; i++) {
            const day = attendance[i]
            const nextDay = attendance[i + 1]
            // range about to start
            if (day == 0 && nextDay == 1) {
                start = i + 1
                continue
            }

            // range about to end
            if (day == 1 && nextDay == 0) {
                end = i
                ranges.push({ start: start + min, end: end + min })
            }
        }

        // the last day should always be attended as the attendancy is created
        // from the min and max values in the existing array
        ranges.push({ start: start + min, end: attendanceLength - 1 + min })

        return ranges
    }

    function submit() {
        createRangeMutation.mutate({ meetingId: id, ranges: rangesFromDays() })
    }

    return (
        <Container>
            <form onSubmit={(e) => {
                e.preventDefault()
                submit()
            }}>
                <Stack align="center">
                    <Title align="center" mt={10}>{name}</Title>
                    <Text align="center" color="dark" size="xl">Click on the calendar to edit your date registries</Text>
                    <Calendar
                        size="lg"
                        fullWidth
                        value={Array.from(days).map(daysToDate)}
                        onChange={(val) => setDays(new Set(val.map(dateToDays)))}
                        multiple
                        maxDate={daysToDate(end)}
                        minDate={daysToDate(Math.max(start, dateToDays(new Date())))}
                        initialMonth={daysToDate(start)}
                    />
                    {!setsAreEqual(initialDays, days) ? <Group>
                        <Button disabled={isLoading} uppercase type="submit">submit</Button>
                        <Button disabled={isLoading} uppercase color="red" onClick={() => setDays(initialDays)}>cancel</Button>
                    </Group> : ""}
                </Stack>
            </form>
        </Container>
    )
}

export default Register