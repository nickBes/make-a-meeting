import React from "react"
import type { AppProps } from "next/app"

const app : React.FC<AppProps> = ({Component, pageProps}) => {
    return <Component {...pageProps}/>
}

export default app