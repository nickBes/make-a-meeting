import prisma from "@/prisma/db"
import { dateToDays } from "@/utils"
import { NextApiHandler } from "next"
import { unstable_getServerSession } from "next-auth"
import { isMatching, P } from "ts-pattern"
import { authOptions } from "./auth/[...nextauth]"

const createMeetingSchema = {
    name: P.string,
    start: P.number,
    end: P.number
}

export type CreateMeetingData = P.infer<typeof createMeetingSchema>

const handler: NextApiHandler<{ meetingId: string }> = async (req, res) => {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
        // unauthorized
        res.status(401)
        return
    }

    if (req.method !== "POST") {
        // only available for post
        res.status(404)
        return
    }

    if (!isMatching(createMeetingSchema, req.body) || req.body.start < dateToDays(new Date())) {
        // data doesn't match the schema or the starting date was in the past
        res.status(400)
        return
    }

    const meeting = await prisma.meeting.create({
        data: {
            ...req.body, owner: {
                connect: {
                    email: session.user.email
                }
            }
        }
    })

    res.status(200).send({ meetingId: meeting.id })
}

export default handler