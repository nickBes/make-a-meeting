import React from "react"
import { NextLink } from "@mantine/next"
import { useSession, signIn, signOut } from "next-auth/react"
import { Menu as MMenu, ActionIcon } from "@mantine/core"
import { Menu2, NewSection, CalendarEvent, Logout, Login } from "tabler-icons-react"

const Menu: React.FC = () => {
    const { data: session } = useSession()

    return <MMenu position="left-start">
        <MMenu.Target>
            <ActionIcon size="lg" variant="light">
                <Menu2 size={28} />
            </ActionIcon>
        </MMenu.Target>
        <MMenu.Dropdown>
            <MMenu.Label>Navigate</MMenu.Label>
            <MMenu.Item
                color="blue"
                icon={<NewSection />}
                component={NextLink}
                href="/meetings/create">Create</MMenu.Item>
            <MMenu.Item
                color="blue"
                icon={<CalendarEvent />}
                component={NextLink}
                href="/meetings">My Meetings</MMenu.Item>
            <MMenu.Divider />
            {session ?
                <MMenu.Item
                    onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                    icon={<Logout />}
                    color="red">Sign Out</MMenu.Item> :
                <MMenu.Item
                    onClick={() => signIn()}
                    icon={<Login />}
                    color="cyan">Sign In</MMenu.Item>
            }
        </MMenu.Dropdown>
    </MMenu>
}

export default Menu