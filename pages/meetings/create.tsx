import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { Meeting } from "@prisma/client"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"
import prisma from "@/prisma/db"
import Link from "next/link"
import { Button, Center, Container, Stack, Text, Title, ScrollArea, Modal, Card, Group, ThemeIcon } from "@mantine/core"
import React, { useState } from "react"
import CreateMeetingForm from "@/components/create_meeting_form"
import { useListState } from "@mantine/hooks"
import { useMutation } from "@tanstack/react-query"
import { DeleteMeetingData } from "../api/meeting"
import axios from "axios"
import { ZoomQuestion } from "tabler-icons-react"
import TextTruncate from "react-text-truncate"

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

const Create: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ meetings }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [meetingList, meetingListHandlers] = useListState(meetings.map(meeting => ({ isDisabled: false, ...meeting })))

    const mutation = useMutation(async (deleteMeetingData: DeleteMeetingData & { index: number }) => {
        let meeting = meetingList[deleteMeetingData.index]
        meeting.isDisabled = true
        meetingListHandlers.setItem(deleteMeetingData.index, meeting)
        await axios.delete("/api/meeting/", { data: deleteMeetingData })
        meeting.isDisabled = false
        meetingListHandlers.setItem(deleteMeetingData.index, meeting)
        return deleteMeetingData.index
    }, {
        onError: (err) => console.log(err),
        onSuccess: (meetingIndex) => {
            meetingListHandlers.remove(meetingIndex)
        }
    })
    return (
        <Container p={10} size="xs">
            <Center>
                <Stack spacing="xs" align="center">
                    <Title
                        align="center"
                        color="black"
                        weight="bold">Created Meetings</Title>
                    <Text color="dark" align="center" size="sm">This is a list of your previously created meetings</Text>
                </Stack>
            </Center>
            <Stack p={10}>
                <ScrollArea.Autosize type="always" maxHeight="70vh">
                    {meetingList.length == 0 ?
                        <Card withBorder>
                            <Stack justify="center" align="center" style={{ minHeight: "30vh" }}>
                                <ThemeIcon m={10} size="xl" variant="light" color="yellow">
                                    <ZoomQuestion />
                                </ThemeIcon>
                                <Text align="center" color="dark" size="lg">There are no created meetings yet</Text>
                            </Stack>
                        </Card>
                        : ""}
                    <Stack>
                        {meetingList.map((meeting, index) => {
                            return (
                                <Card key={meeting.id} withBorder>
                                    <Stack align="stretch" justify="center">
                                        <Title order={2} color="dark" align="center">{meeting.name}</Title>
                                        <Text align="center" color="dimmed">{meeting.desc == "" || !meeting.desc ? "There is no description" : <TextTruncate text={meeting.desc} />}</Text>
                                        <Group position="center">
                                            <Link href={`/meetings/${meeting.id}`}>
                                                <Button uppercase variant="filled">View</Button>
                                            </Link>
                                            <Button disabled={meeting.isDisabled} onClick={() => mutation.mutate({ meetingId: meeting.id, index })} uppercase color="red">Delete</Button>
                                        </Group>
                                    </Stack>
                                </Card>
                            )
                        })}
                    </Stack>
                </ScrollArea.Autosize>
                <Button uppercase onClick={() => setIsOpen(prev => !prev)}>Create</Button>
            </Stack>
            <Modal centered title="Create A New Meeting" opened={isOpen} onClose={() => setIsOpen(false)}>
                <CreateMeetingForm
                    onSuccess={(meeting) => meetingListHandlers.prepend({ ...meeting, isDisabled: false })}
                    onSubmited={() => setIsOpen(false)} />
            </Modal>
        </Container>
    )
}

export default Create