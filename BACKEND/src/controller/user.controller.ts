import { getAllUserUrlsDao } from "../dao/user.dao.ts"
import type { Context } from "hono"

export const getAllUserUrls = async (c: Context) => {
    const user = c.get('user')
    const urls = await getAllUserUrlsDao(user._id)
    return c.json({message:"success",urls}, 200)
}