import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "@/prisma/db"
import React from "react"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Meeting } from "@prisma/client"

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

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        select: {
            meetings: true
        }
    })

    if (user == null) {
        return { notFound: true }
    }

    return { props: user }
}

const Meetings: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ meetings }) => {
    return (
        <>{JSON.stringify(meetings)}</>
    )
}
export default Meetings

