import urlSchema from "../models/url.model.ts";
import { ConflictError } from "../utils/errorHandler.ts";

export const saveShortUrl = async (shortUrl: string, longUrl: string, userId?: string) => {
    try{
        const newUrl = new urlSchema({
            full_url:longUrl,
            short_url:shortUrl
        })
        if(userId){
            newUrl.user = userId as any
        }
        await newUrl.save()
    }catch(err: any){
        if(err.code == 11000){
            throw new ConflictError("Short URL already exists")
        }
        throw new Error(err)
    }
};

export const getShortUrl = async (shortUrl: string) => {
    return await urlSchema.findOneAndUpdate({short_url:shortUrl},{$inc:{clicks:1}});
}

export const getCustomShortUrl = async (slug: string) => {
    return await urlSchema.findOne({short_url:slug});
}