import React from "react"
import { Button, Stack, Title, Container, Text } from "@mantine/core"
import Link from "next/link"
import Image from "next/image"
import calendar from "@/static/calendar.jpg"

const Home: React.FC = () => {
    return (
        <Container size="xs">
            <Stack style={{ minHeight: "70vh" }} justify="center" align="center">
                <Title align="center">Create Meetings With The Highest Attendance!</Title>
                <Text color="dark" size="xl" align="center">By simply signing in, creating a meeting and sharing it you could get the date with the highest attendance</Text>
                <Link href="/meetings/create">
                    <Button uppercase>Create</Button>
                </Link>
                <Image alt="Decorative Calendar Image" src={calendar} />
            </Stack>
        </Container>
    )
}

export default Home