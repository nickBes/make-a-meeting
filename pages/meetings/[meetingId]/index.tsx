import prisma from "@/prisma/db"
import { Meeting } from "@prisma/client"
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next"
import React from "react"
import { Button, Stack } from "@mantine/core"
import Link from "next/link"

// !todo
// in the future we'll also fetch the date 
// with the highest attendance 

export const getStaticPaths: GetStaticPaths = async () => {
    const meetings = await prisma.meeting.findMany()
    const paths = meetings.map(({ id }) => ({ params: { meetingId: id } }))

    return { paths, fallback: "blocking" }
}

export const getStaticProps: GetStaticProps<{ meeting: Meeting }, { meetingId?: string }> = async ({ params }) => {
    if (!params?.meetingId) {
        return { notFound: true }
    }

    const meeting = await prisma.meeting.findUnique({
        where: {
            id: params.meetingId
        }
    })

    if (!meeting) {
        return { notFound: true }
    }

    return {
        props: { meeting },
        // every one minute
        revalidate: 60
    }
}

const Meeting: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ meeting }) => {
    return (
        <Stack align="center">
            <p>{JSON.stringify(meeting)}</p>
            <Link href={`/meetings/${meeting.id}/register`}>
                <Button>Register</Button>
            </Link>
        </Stack>
    )
}

export default Meeting