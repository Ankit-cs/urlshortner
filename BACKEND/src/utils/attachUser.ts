import { findUserById } from "../dao/user.dao.ts"
import { verifyToken } from "./helper.ts"
import { getCookie } from "hono/cookie"
import type { Context, Next } from "hono"

export const attachUser = async (c: Context, next: Next) => {
    const token = getCookie(c, "accessToken")
    if(!token) return await next()

    try {
        const decoded = await verifyToken(token)
        const user = await findUserById(decoded)
        if(!user) return await next()
        c.set('user', user)
        await next()
    } catch (error) {
        console.log(error)
        await next()
    }
}