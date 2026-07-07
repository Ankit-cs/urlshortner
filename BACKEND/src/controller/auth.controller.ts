import { cookieOptions } from "../config/config.ts"
import { loginUser, registerUser } from "../services/auth.service.ts"
import { setCookie, deleteCookie } from "hono/cookie"
import type { Context } from "hono"

export const register_user = async (c: Context) => {
    const {name, email, password} = await c.req.json()
    const {token,user} = await registerUser(name, email, password)
    c.set('user', user)
    setCookie(c, "accessToken", token, cookieOptions as any)
    return c.json({user:user, message:"register success"}, 200)
}

export const login_user = async (c: Context) => {
    const {email, password} = await c.req.json()
    const {token,user} = await loginUser(email, password)
    c.set('user', user)
    setCookie(c, "accessToken", token, cookieOptions as any)
    return c.json({user:user,message:"login success"}, 200)
}

export const logout_user = async (c: Context) => {
    deleteCookie(c, "accessToken", cookieOptions as any)
    return c.json({message:"logout success"}, 200)
}

export const get_current_user = async (c: Context) => {
    return c.json({user:c.get('user')}, 200)
}