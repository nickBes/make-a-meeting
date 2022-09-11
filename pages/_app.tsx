import "@/styles/global.css"
import React from "react"
import type { AppProps } from "next/app"
import Menu from "@/components/menu"
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createStyles, Header, Text, MantineProvider, Title, Center } from "@mantine/core"
import Link from "next/link"

const queryClient = new QueryClient()

const useStyles = createStyles({
    heading: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20
    },
    mainTitle: {
        cursor: "pointer"
    }
})

const app: React.FC<AppProps> = ({ Component, pageProps }) => {
    const { classes } = useStyles()

    return (
        <SessionProvider session={pageProps.session}>
            <QueryClientProvider client={queryClient}>
                <MantineProvider>
                    <Header
                        className={classes.heading}
                        height={60}>
                        <Link href="/"><Title className={classes.mainTitle} order={3}>meetings</Title></Link>
                        <Menu />
                    </Header>
                    <Component {...pageProps} />
                    <Center style={{ position: "absolute", bottom: "2%", width: "100%" }}>
                        <footer >
                            <Text color="dimmed">Made By <Link href="https://github.com/nickBes">Nick Bespaly</Link></Text>
                        </footer>
                    </Center>
                </MantineProvider>
            </QueryClientProvider>
        </SessionProvider >
    )
}

export default app