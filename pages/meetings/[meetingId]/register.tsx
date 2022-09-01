import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { DateRange } from "@prisma/client"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { unstable_getServerSession } from "next-auth"
import prisma from "@/prisma/db"
import React from "react"

export const getServerSideProps: GetServerSideProps<{ ranges: DateRange[] }, { meetingId?: string }> = async ({ req, res, params }) => {
    const session = await unstable_getServerSession(req, res, authOptions)

    if (!session?.user?.email) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    if (!params?.meetingId) {
        return { notFound: true }
    }

    const ranges = await prisma.dateRange.findMany({
        where: {
            user: {
                email: session.user.email
            },
            meetingId: params.meetingId
        }
    })

    return {
        props: { ranges }
    }
}

const Register: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ ranges }) => {
    return (
        <>register</>
    )
}

export default Register