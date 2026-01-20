import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { seed } from "./data/memory.js";
import authRouter from "./routes/auth.js";
import oauthRouter from "./routes/oauth.js";
import discussionsRouter from "./routes/discussions.js";
import discussionDetailRouter from "./routes/discussionDetail.js";
import pollRouter from "./routes/poll.js";
import messagesRouter from "./routes/messages.js";
import votesRouter from "./routes/votes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import buildingsRouter from "./routes/buildings.js";
import adminRouter from "./routes/admin.js";
import stanplanRouter from "./routes/stanplan.js";

await seed();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/discussions", discussionsRouter);
app.use("/api/discussions", discussionDetailRouter);
app.use("/api/discussions", pollRouter);
app.use("/api/discussions", messagesRouter);
app.use("/api/polls", votesRouter);
app.use("/api/buildings", buildingsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/stanplan", stanplanRouter)

import passport from "passport";
import "./auth/googleStrategy.js";

app.use(passport.initialize());
app.use("/auth", oauthRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// za React
app.use(express.static(path.join(__dirname, "dist")));

app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.set("Cache-Control", "no-store, must-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
    }
    next();
});

// SPA fallback (regex) - sve što NIJE /api ide na index.html
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});
