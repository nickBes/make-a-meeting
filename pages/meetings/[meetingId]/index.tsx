import prisma from "@/prisma/db"
import { Meeting } from "@prisma/client"
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next"
import React from "react"
import { Button, RingProgress, Stack, Title, Card, Badge, Text, ThemeIcon } from "@mantine/core"
import Link from "next/link"
import { attendanceFromRanges, dateToDays, daysToDate } from "@/utils"
import { ZoomQuestion } from "tabler-icons-react"

export const getStaticPaths: GetStaticPaths = async () => {
    const meetings = await prisma.meeting.findMany()
    const paths = meetings.map(({ id }) => ({ params: { meetingId: id } }))

    return { paths, fallback: "blocking" }
}

export const getStaticProps: GetStaticProps<{ meeting: Meeting, day: number | null, attendance: number, registries: number }, { meetingId?: string }> = async ({ params }) => {
    if (!params?.meetingId) {
        return { notFound: true }
    }

    const meeting = await prisma.meeting.findUnique({
        where: {
            id: params.meetingId
        },
        include: {
            dateRanges: {
                select: {
                    id: true,
                    start: true,
                    end: true,
                    userId: true,
                }
            }
        }
    })

    if (!meeting) {
        return { notFound: true }
    }

    if (meeting.dateRanges.length == 0) {
        return {
            props: { meeting, day: null, registries: 0, attendance: 0 },
            // every two minute
            revalidate: 120
        }
    }

    let rangesByUserId = new Set<string>()

    meeting.dateRanges.forEach(range => {
        rangesByUserId.add(range.userId)
    })

    const registries = rangesByUserId.size

    const { attendance, offset } = attendanceFromRanges(meeting.dateRanges)
    let max = attendance[0]
    let maxIndex = 0
    let todayIndex = dateToDays(new Date()) - offset


    if (todayIndex >= attendance.length) {
        return {
            props: { meeting, day: null, attendance: 0, registries },
            // every two minute
            revalidate: 120
        }
    }

    for (let i = todayIndex; i < attendance.length; i++) {
        const current = attendance[i]
        if (current > max) {
            max = current
            maxIndex = i
        }
    }

    return {
        props: {
            meeting: {
                id: meeting.id,
                ownerId: meeting.ownerId,
                start: meeting.start,
                end: meeting.end,
                name: meeting.name,
                desc: meeting.desc
            }, day: maxIndex + offset,
            registries,
            attendance: max
        },
        // every two minute
        revalidate: 120
    }
}

const Meeting: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ meeting, day, attendance, registries }) => {
    return (
        <Stack align="center" p={10} pt={20}>
            <Card style={{ minHeight: "40vh", display: "flex", alignItems: "center" }} withBorder p="xl">
                <Stack justify="space-between" align="center">
                    <Title align="center">{meeting.name}</Title>
                    <Text align="center" color="dimmed">{meeting.desc == "" || !meeting.desc ? "There is no description" : meeting.desc}</Text>
                    <Badge variant="dot">Highest attendance date</Badge>

                    {day ? <>
                        <Title color="dark" order={2}>{new Intl.DateTimeFormat('en', {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }).format(daysToDate(day))}</Title>
                        <RingProgress
                            thickness={16}
                            size={200}
                            label={
                                <Title color="dark" order={5} align="center">{attendance} of {registries}</Title>
                            }
                            sections={[{ value: registries == 0 ? 0 : 100 * (attendance / registries), color: "teal" }]}></RingProgress>

                    </> : <>
                        <ThemeIcon size="xl" variant="light" color="yellow">
                            <ZoomQuestion />
                        </ThemeIcon>
                        <Text align="center" color="dark" size="md">There are not enough registries</Text>
                    </>}

                    <Link href={`/meetings/${meeting.id}/register`}>
                        <Button uppercase>Register</Button>
                    </Link>
                </Stack>
            </Card>

        </Stack>
    )
}

export default Meeting