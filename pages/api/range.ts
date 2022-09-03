import { NextApiHandler } from "next"
import { unstable_getServerSession } from "next-auth"
import { isMatching, P } from "ts-pattern"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "@/prisma/db"

const CreateDateRangeSchema = {
    meetingId: P.string,
    start: P.number,
    end: P.number
}

export type CreateDateRangeData = P.infer<typeof CreateDateRangeSchema>

const handler: NextApiHandler<{ rangeId: string }> = async (req, res) => {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
        res.status(401)
        return
    }

    if (req.method !== "POST") {
        res.status(404)
        return
    }

    if (!isMatching(CreateDateRangeSchema, req.body) || req.body.start > req.body.end) {
        res.status(400)
        return
    }

    const meeting = await prisma.meeting.findUnique({
        where: {
            id: req.body.meetingId
        },
        include: {
            dateRanges: {
                where: {
                    user: {
                        email: session.user.email
                    }
                }
            }
        }
    })

    if (!meeting) {
        res.status(404)
        return
    }

    let isIntercepting = false

    for (let range of meeting.dateRanges) {
        // a range is interpecting with another, if the start / end of one range is in the compared range 
        if ((req.body.end <= range.end && req.body.end >= range.start) || (req.body.start <= range.end && req.body.start >= range.start)) {
            isIntercepting = true
            break
        }
    }

    if (req.body.start < meeting.start || req.body.end > meeting.end || isIntercepting) {
        res.status(400)
        return
    }

    const range = await prisma.dateRange.create({
        data: {
            user: {
                connect: {
                    email: session.user.email
                }
            },
            meeting: {
                connect: {
                    id: req.body.meetingId
                }
            },
            start: req.body.start,
            end: req.body.end
        },
        select: {
            id: true
        }
    })

    res.status(200).send({ rangeId: range.id })
}

export default handler