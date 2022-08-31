import { useSession, signIn, signOut } from "next-auth/react"
import React from "react"
import { Button, Stack } from "@mantine/core"
import Link from "next/link"

const Home: React.FC = () => {
    const { data: session, status } = useSession()
    let Login: React.FC

    if (session) {
        Login = () => <Button onClick={() => signOut()}>Sign Out</Button>
    } else {
        Login = () => <Button onClick={() => signIn()}> Sign In</Button>
    }

    if (status === "loading") {
        return <>Loading</>
    }

    return (
        <Stack align="center">
            <Link href="/meetings">My Meetings</Link>
            <Login />
        </Stack>
    )
}

export default Home