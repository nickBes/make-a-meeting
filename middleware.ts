export { default } from "next-auth/middleware"

export const config = {
    matcher: ["/meetings/:path*/register", "/meetings", "/meetings/create"]
}