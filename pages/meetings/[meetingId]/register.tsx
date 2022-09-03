import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { DateRange, Meeting } from "@prisma/client"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { unstable_getServerSession } from "next-auth"
import { attendanceFromRanges, dateToDays, daysToDate } from "@/utils"
import prisma from "@/prisma/db"
import React, { useState } from "react"
import { DateRangePicker } from "@mantine/dates"
import { Button, Stack, Title } from "@mantine/core"
import { useListState } from "@mantine/hooks"

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

const Register: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ dateRanges, start, end }) => {
    const [ranges, rangesHandler] = useListState(dateRanges)
    const [days, setDays] = useState<[number, number]>()
    const attendanceMap = attendanceFromRanges(ranges)

    return (
        <Stack align="center">
            <Stack align="center">
                <Title align="center">{dateRanges.length == 0 ? "No Registered Dates" : "Your Dates"}</Title>
                {dateRanges.map(range => {
                    return <DateRangePicker
                        disabled
                        value={[range.start, range.end].map(daysToDate) as [Date, Date]}
                    />
                })}
            </Stack>
            <form>
                <Stack>
                    <DateRangePicker
                        label="Add New Dates"
                        excludeDate={(date) => {
                            if (attendanceMap.attendance.length == 0) return false

                            const day = dateToDays(date) - attendanceMap.offset

                            if (day < 0 || day >= attendanceMap.attendance.length) return true

                            return !!attendanceMap.attendance[day]
                        }}
                        minDate={daysToDate(start)}
                        maxDate={daysToDate(end)}
                    />
                    <Button>Add new date</Button>
                </Stack>
            </form>
        </Stack>
    )
}

export default Register