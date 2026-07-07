import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.config.ts";
import shortUrlRoutes from "./src/routes/shortUrl.route.ts";
import userRoutes from "./src/routes/user.route.ts";
import authRoutes from "./src/routes/auth.route.ts";
import { redirectFromShortUrl } from "./src/controller/shortUrl.controller.ts";
import { errorHandler } from "./src/utils/errorHandler.ts";
import { attachUser } from "./src/utils/attachUser.ts";

dotenv.config();

const app = express();

app.use(cors({
    origin: 'https://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachUser);

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/create", shortUrlRoutes);
app.get("/:id", redirectFromShortUrl);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on ${process.env.APP_URL || `http://localhost:${PORT}`}`);
});
