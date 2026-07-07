import { findUserById } from "../dao/user.dao.ts"
import { verifyToken } from "../utils/helper.ts"
import { getCookie } from "hono/cookie"
import type { Context, Next } from "hono"

export const authMiddleware = async (c: Context, next: Next) => {
    const token = getCookie(c, "accessToken")
    if(!token) return c.json({message:"Unauthorized"}, 401)
    try {
        const decoded = await verifyToken(token)
        const user = await findUserById(decoded)
        if(!user) return c.json({message:"Unauthorized"}, 401)
        c.set('user', user)
        await next()
    } catch (error) {
        return c.json({message:"Unauthorized", error}, 401)
    }
}