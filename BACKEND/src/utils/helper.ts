import { nanoid } from "nanoid";
import { cookieOptions } from "../config/config.ts";
import jsonwebtoken from "jsonwebtoken"

export const generateNanoId = (length: number) =>{
    return nanoid(length);
}

export const signToken = (payload: any) =>{
    return jsonwebtoken.sign(payload, process.env.JWT_SECRET as string, {expiresIn: "1h"})
}

export const verifyToken = (token: string) =>{
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET as string) as any;
    return decoded.id
}