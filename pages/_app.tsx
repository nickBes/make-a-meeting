import React from "react"
import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"

const app: React.FC<AppProps> = ({ Component, pageProps }) => {

    return (
        <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
        </SessionProvider>
    )
}

export default app