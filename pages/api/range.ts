import { NextApiHandler } from "next"
import { unstable_getServerSession } from "next-auth"
import { isMatching, P } from "ts-pattern"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "@/prisma/db"
import { attendanceFromRanges, dateToDays } from "@/utils"

const CreateDateRangeSchema = {
    meetingId: P.string,
    ranges: P.array({
        start: P.number,
        end: P.number
    })
}

export type CreateDateRangeData = P.infer<typeof CreateDateRangeSchema>

const handler: NextApiHandler = async (req, res) => {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
        res.status(401).send({})
        return
    }

    if (req.method !== "POST") {
        res.status(404).send({})
        return
    }

    if (!isMatching(CreateDateRangeSchema, req.body)) {
        res.status(400).send({})
        return
    }

    let { attendance, offset } = attendanceFromRanges(req.body.ranges)
    let today = dateToDays(new Date())
    if ((offset < today && attendance.length != 0) || attendance.find(day => day > 1)) {
        res.status(400).send({})
        return
    }

    const meeting = await prisma.meeting.findUnique({
        where: {
            id: req.body.meetingId
        }
    })

    let end = attendance.length - 1 + offset

    if (!meeting || ((offset < meeting.start || end > meeting.end) && attendance.length != 0)) {
        res.status(404).send({})
        return
    }

    try {
        // delete previous ranges
        await prisma.dateRange.deleteMany({
            where: {
                meetingId: meeting.id,
                user: {
                    email: session.user.email
                }
            }
        })

        if (attendance.length == 0) {
            res.status(200).send({})
            return
        }

        const user = await prisma.user.findFirstOrThrow({
            where: {
                email: session.user.email
            }
        })

        await prisma.dateRange.createMany({
            data: req.body.ranges.map(range => ({ ...range, meetingId: meeting.id, userId: user.id }))
        })
        res.status(200).send({})
    } catch {
        res.status(416).send({})
    }
}

export default handler