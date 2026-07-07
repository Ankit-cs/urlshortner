import { getShortUrl } from "../dao/short_url_db.ts";
import { createShortUrlWithoutUser, createShortUrlWithUser } from "../services/short_url.service.ts";
import type { Context } from "hono"

export const createShortUrl = async (c: Context) => {
  const data = await c.req.json();
  let shortUrl;

  const user = c.get('user');

  if (user) {
    shortUrl = await createShortUrlWithUser(data.url, user._id, data.slug);
  } else {
    shortUrl = await createShortUrlWithoutUser(data.url, data.slug);
  }

  return c.json({ shortUrl: `${process.env.APP_URL}/${shortUrl}` }, 200);
};

export const redirectFromShortUrl = async (c: Context) => {
  const id = c.req.param('id');
  const url = await getShortUrl(id);
  if (!url) throw new Error("Short URL not found");
  return c.redirect(url.full_url as string);
};

export const createCustomShortUrl = async (c: Context) => {
  const { url, slug } = await c.req.json();
  const shortUrl = await createShortUrlWithoutUser(url, slug);
  return c.json({ shortUrl: `${process.env.APP_URL}/${shortUrl}` }, 200);
};

