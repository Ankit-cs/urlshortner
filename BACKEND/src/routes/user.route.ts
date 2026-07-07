import { Hono } from "hono";
import { getAllUserUrls } from "../controller/user.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = new Hono();

router.get("/urls", authMiddleware, getAllUserUrls);

export default router;