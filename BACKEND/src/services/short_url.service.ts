import { generateNanoId } from "../utils/helper.ts"
import urlSchema from "../models/url.model.ts"
import { getCustomShortUrl, saveShortUrl } from "../dao/short_url_db.ts"

export const createShortUrlWithoutUser = async (url: string, slug: string | null = null) => {
    const shortUrl = generateNanoId(7)
    if(!shortUrl) throw new Error("Short URL not generated")
    await saveShortUrl(shortUrl,url)
    return shortUrl
}

export const createShortUrlWithUser = async (url: string, userId: any, slug: string | null = null) => {
    const shortUrl = slug || generateNanoId(7)
    if (slug) {
        const exists = await getCustomShortUrl(slug);
        if(exists) throw new Error("This custom url already exists")
    }

    await saveShortUrl(shortUrl,url,userId)
    return shortUrl
}