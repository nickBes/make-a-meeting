import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "@/prisma/db"
import React from "react"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Meeting } from "@prisma/client"
import { Button, Card, Stack, Title } from "@mantine/core"
import Link from "next/link"

export const getServerSideProps: GetServerSideProps<{ meetings: Meeting[] }> = async (ctx) => {
    const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions)

    if (!session?.user?.email) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const meetings = await prisma.meeting.findMany({
        where: {
            owner: {
                email: session.user.email
            }
        }
    })

    return { props: { meetings } }
}

const Meetings: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ meetings }) => {
    return (
        <Stack align="center">
            {meetings.map(meeting => {
                return (
                    <Card key={meeting.id} withBorder shadow="md">
                        <Title>{meeting.name}</Title>
                        <Link href={`/meetings/${meeting.id}`}>
                            <Button>View</Button>
                        </Link>
                    </Card>
                )
            })}
            <Link href={"/meetings/create"}>
                <Button>Create</Button>
            </Link>
        </Stack>
    )
}
export default Meetings