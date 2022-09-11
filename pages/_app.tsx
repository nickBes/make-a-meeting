import "@/styles/global.css"
import React from "react"
import type { AppProps } from "next/app"
import Menu from "@/components/menu"
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createStyles, Header, MantineProvider, Title } from "@mantine/core"
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
                </MantineProvider>
            </QueryClientProvider>
        </SessionProvider>
    )
}

export default app