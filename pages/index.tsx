import { useSession, signIn, signOut } from "next-auth/react"
import React from "react"

const Home: React.FC = () => {
    const { data: session } = useSession()

    if (session) {
        return <button onClick={() => signOut()}>Sign Out</button>
    }
    return <button onClick={() => signIn()}>Sign In</button>
}

export default Home