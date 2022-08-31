import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/prisma/db"
import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt"
    }
}

export default NextAuth(authOptions)