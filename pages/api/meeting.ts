import prisma from "@/prisma/db"
import { dateToDays } from "@/utils"
import { Meeting } from "@prisma/client"
import { NextApiHandler } from "next"
import { unstable_getServerSession } from "next-auth"
import { isMatching, P } from "ts-pattern"
import { authOptions } from "./auth/[...nextauth]"

const createMeetingSchema = {
    name: P.string,
    start: P.number,
    end: P.number,
    desc: P.string
}

const deleteMeetingSchema = {
    meetingId: P.string
}

export type DeleteMeetingData = P.infer<typeof deleteMeetingSchema>

export type CreateMeetingData = P.infer<typeof createMeetingSchema>

const handler: NextApiHandler<{ meeting: Meeting } | undefined> = async (req, res) => {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
        // unauthorized
        res.status(401).send(undefined)
        return
    }

    if (req.method == "POST") {
        if (!isMatching(createMeetingSchema, req.body) || dateToDays(new Date()) - req.body.start > 1) {
            // data doesn't match the schema or the starting date was in the past
            res.status(400).send(undefined)
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

        res.status(200).send({ meeting: meeting })
        return
    } else if (req.method == "DELETE") {
        if (!isMatching(deleteMeetingSchema, req.body)) {
            res.status(400).send(undefined)
            return
        }

        const [meeting, user] = await Promise.all([
            prisma.meeting.findUnique({
                where: {
                    id: req.body.meetingId
                }
            }),
            prisma.user.findUnique({
                where: {
                    email: session.user.email
                }
            })
        ])

        if (!meeting || !user || meeting.ownerId != user.id) {
            res.status(400).send(undefined)
            return
        }

        await prisma.meeting.delete({
            where: {
                id: req.body.meetingId
            }
        })
        res.status(200).send(undefined)
    } else {
        res.status(404).send(undefined)
    }

}

export default handler