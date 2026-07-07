import express from 'express';
import { createShortUrl, redirectFromShortUrl } from '../controller/shortUrl.controller.ts';
const router = express.Router();

router.post("/",createShortUrl);
router.get("/:id", redirectFromShortUrl);

export default router;