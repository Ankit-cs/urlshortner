import { Hono } from "hono";
import { createCustomShortUrl, createShortUrl } from "../controller/shortUrl.controller.ts";

const router = new Hono();

router.post("/", createShortUrl);
router.post("/custom", createCustomShortUrl);

export default router;