import express from "express"
import { getAllUserUrls } from "../controller/user.controller.ts"
import { authMiddleware } from "../middleware/auth.middleware.ts"

const router = express.Router()

router.post("/urls",authMiddleware, getAllUserUrls)

export default router