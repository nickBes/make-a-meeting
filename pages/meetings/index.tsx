import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "@/prisma/db"
import React from "react"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Meeting } from "@prisma/client"
import { Card, Button, Group, ThemeIcon, Text, Center, Container, Stack, Title, ScrollArea } from "@mantine/core"
import Link from "next/link"
import { ZoomQuestion } from "tabler-icons-react"
import TextTruncate from "react-text-truncate"

export const getServerSideProps: GetServerSideProps<{ registered: Meeting[] }> = async (ctx) => {
    const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions)

    if (!session?.user?.email) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const registered = await prisma.meeting.findMany({
        where: {
            dateRanges: {
                some: {
                    user: {
                        email: session.user.email
                    }
                },
            }
        }
    })

    return { props: { registered } }
}

const Meetings: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ registered }) => {
    return (
        <Container p={10} size="xs">
            <Center>
                <Stack spacing="xs" align="center">
                    <Title
                        align="center"
                        color="black"
                        weight="bold">My Meetings</Title>
                    <Text color="dark" align="center" size="sm">This is a list of your participated meetings</Text>
                </Stack>
            </Center>
            <Center>
                <ScrollArea.Autosize mt={10} type="always" maxHeight="70vh">
                    {registered.length == 0 ?
                        <Card withBorder>
                            <Stack justify="center" align="center" style={{ minHeight: "30vh" }}>
                                <ThemeIcon m={10} size="xl" variant="light" color="yellow">
                                    <ZoomQuestion />
                                </ThemeIcon>
                                <Text align="center" color="dark" size="lg">There are no participated meetings</Text>
                            </Stack>
                        </Card>
                        : ""}
                    <Stack align="stretch">
                        {registered.map((meeting) => {
                            return (
                                <Card p="xl" key={meeting.id} withBorder style={{ minWidth: "50vw" }}>
                                    <Stack align="stretch" justify="center">
                                        <Title order={2} color="dark" align="center">{meeting.name}</Title>
                                        <Text align="center" color="dimmed">{meeting.desc == "" || !meeting.desc ? "There is no description" : <TextTruncate text={meeting.desc} />}</Text>
                                        <Group position="center">
                                            <Link href={`/meetings/${meeting.id}`}>
                                                <Button uppercase variant="filled">View</Button>
                                            </Link>
                                        </Group>
                                    </Stack>
                                </Card>
                            )
                        })}
                    </Stack>
                </ScrollArea.Autosize>
            </Center>
        </Container>
    )
}
export default Meetings