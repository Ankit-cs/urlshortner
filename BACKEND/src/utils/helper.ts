import { nanoid } from "nanoid";
import { cookieOptions } from "../config/config.ts";
import jwt from "@tsndr/cloudflare-worker-jwt"

export const generateNanoId = (length: number) =>{
    return nanoid(length);
}

export const signToken = async (payload: any) =>{
    return await jwt.sign({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, process.env.JWT_SECRET as string)
}

export const verifyToken = async (token: string) =>{
    const isValid = await jwt.verify(token, process.env.JWT_SECRET as string)
    if (!isValid) throw new Error("Invalid Token")
    const { payload } = jwt.decode(token)
    return payload.id
}