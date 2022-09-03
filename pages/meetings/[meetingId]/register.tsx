import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Meeting } from "@prisma/client"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { unstable_getServerSession } from "next-auth"
import { attendanceFromRanges, dateToDays, daysToDate } from "@/utils"
import prisma from "@/prisma/db"
import React, { useMemo, useState } from "react"
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates"
import { Button, Stack, Title } from "@mantine/core"
import { useListState } from "@mantine/hooks"
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

const Register: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ dateRanges, start, end, id }) => {
    const [ranges, rangesHandler] = useListState(dateRanges)
    const attendanceMap = useMemo(() => attendanceFromRanges(ranges), [ranges])
    const [days, setDays] = useState<[number, number]>()

    const createRangeMutation = useMutation(async (createDateRangeData: CreateDateRangeData) => {
        const response = await axios.post<{ rangeId: string }>("/api/range", createDateRangeData)
        return {
            id: response.data.rangeId,
            start: createDateRangeData.start,
            end: createDateRangeData.end
        }
    }, {
        onSuccess: (range) => {
            rangesHandler.append(range)
        }
    })

    function setDatesIntoDays([start, end]: DateRangePickerValue) {
        if (start && end) {
            setDays([start, end].map(dateToDays) as [number, number])
        }
    }
    function submit() {
        if (!days) return
        createRangeMutation.mutate({ meetingId: id, start: days[0], end: days[1] })
    }

    return (
        <Stack align="center">
            <Stack align="center">
                <Title align="center">{dateRanges.length == 0 ? "No Registered Dates" : "Your Dates"}</Title>
                {ranges.map(range => {
                    return <DateRangePicker
                        key={range.id}
                        disabled
                        value={[range.start, range.end].map(daysToDate) as [Date, Date]}
                    />
                })}
            </Stack>
            <form onSubmit={e => {
                e.preventDefault()
                submit()
            }}>
                <Stack>
                    <DateRangePicker
                        label="Add New Dates"
                        excludeDate={(date) => {
                            if (attendanceMap.attendance.length == 0) return false

                            const day = dateToDays(date) - attendanceMap.offset

                            return !!attendanceMap.attendance[day]
                        }}
                        onChange={setDatesIntoDays}
                        minDate={daysToDate(start)}
                        maxDate={daysToDate(end)}
                    />
                    <Button type="submit">Add new date</Button>
                </Stack>
            </form>
        </Stack>
    )
}

export default Register