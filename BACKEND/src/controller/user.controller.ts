import wrapAsync from "../utils/tryCatchWrapper.ts"
import { getAllUserUrlsDao } from "../dao/user.dao.ts"

import type { Request, Response } from "express";

export const getAllUserUrls = wrapAsync(async (req: Request, res: Response) => {
    const {_id} = req.user
    const urls = await getAllUserUrlsDao(_id)
    res.status(200).json({message:"success",urls})
})