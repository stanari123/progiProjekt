import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { db, seed } from "./data/memory.js";
import authRouter from "./routes/auth.js";
import discussionsRouter from "./routes/discussions.js";
import messagesRouter from "./routes/messages.js";
import votesRouter from "./routes/votes.js";

dotenv.config();
await seed();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/discussions", discussionsRouter);
app.use("/api/discussions", messagesRouter);
app.use("/api/discussions", votesRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));
app.set("views", path.join(__dirname, "..", "frontend", "views"));
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

app.get("/", (_req, res) => {
    res.render("index");
});

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});
