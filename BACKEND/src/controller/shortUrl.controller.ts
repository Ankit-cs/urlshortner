import { getShortUrl } from "../dao/short_url_db.ts";
import { createShortUrlWithoutUser, createShortUrlWithUser } from "../services/short_url.service.ts";
import wrapAsync from "../utils/tryCatchWrapper.ts";

import type { Request, Response } from "express";

export const createShortUrl = wrapAsync(async (req: Request, res: Response) => {
  const data = req.body;
  let shortUrl;

  if (req.user) {
    shortUrl = await createShortUrlWithUser(data.url, req.user._id, data.slug);
  } else {
    shortUrl = await createShortUrlWithoutUser(data.url, data.slug);
  }

  res.status(200).json({ shortUrl: `${process.env.APP_URL}/${shortUrl}` });
});

export const redirectFromShortUrl = wrapAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const url = await getShortUrl(id as string);
  if (!url) throw new Error("Short URL not found");
  res.redirect(url.full_url as string);
});

export const createCustomShortUrl = wrapAsync(async (req: Request, res: Response) => {
  const { url, slug } = req.body;
  const shortUrl = await createShortUrlWithoutUser(url, slug);
  res.status(200).json({ shortUrl: `${process.env.APP_URL}/${shortUrl}` });
});

