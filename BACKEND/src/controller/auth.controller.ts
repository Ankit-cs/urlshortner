import { cookieOptions } from "../config/config.ts"
import { loginUser, registerUser } from "../services/auth.service.ts"
import wrapAsync from "../utils/tryCatchWrapper.ts"

import type { Request, Response } from "express";

export const register_user = wrapAsync( async (req: Request, res: Response) => {
    const {name, email, password} = req.body
    const {token,user} = await registerUser(name, email, password)
    req.user = user
    res.cookie("accessToken", token, cookieOptions)
    res.status(200).json({user:user, message:"register success"})
})

export const login_user = wrapAsync( async (req: Request, res: Response) => {
    const {email, password} = req.body
    const {token,user} = await loginUser(email, password)
    req.user = user
    res.cookie("accessToken", token, cookieOptions)
    res.status(200).json({user:user,message:"login success"})
})

export const logout_user = wrapAsync( async (req: Request, res: Response) => {
    res.clearCookie("accessToken", cookieOptions)
    res.status(200).json({message:"logout success"})
})

export const get_current_user = wrapAsync( async (req: Request, res: Response) => {
    res.status(200).json({user:req.user})
})