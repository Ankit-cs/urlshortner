import { Hono } from "hono";
import { get_current_user, login_user, logout_user, register_user } from "../controller/auth.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = new Hono();

router.post("/register", register_user);
router.post("/login", login_user);
router.post("/logout", logout_user);
router.get("/getuser", authMiddleware, get_current_user);

export default router;