import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { db, seed } from "./data/memory.js";
import authRouter from "./routes/auth.js";
import discussionsRouter from "./routes/discussions.js";
import discussionDetailRouter from "./routes/discussionDetail.js";
import pollRouter from "./routes/poll.js";
import messagesRouter from "./routes/messages.js";
import votesRouter from "./routes/votes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { getDiscussionById } from "./services/discussionDetailsService.js";
import buildingsRouter from "./routes/buildings.js";
import adminRouter from "./routes/admin.js";

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
app.use("/api/discussions", votesRouter);
app.use("/api/buildings", buildingsRouter);
app.use("/api/admin", adminRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));
app.use(express.static(path.join(__dirname, "../frontend/public")));

app.get("/", (req, res) => {
  res.render("pages/index", { mode: "list" });
});
app.get("/admin", (req, res) => res.render("pages/admin"));
app.get("/login", (_req, res) => res.render("pages/login"));
app.get("/discussions/:id", (req, res, next) => {
  const id = req.params.id;

  try {
    // lažni user koji može vidjeti sve, samo za SSR
    const fakeUser = { sub: "ssr", role: "admin", email: "ssr@local" };

    const discussion = getDiscussionById(id, fakeUser);

    return res.render("pages/index", {
      mode: "detail",
      discussionId: discussion.id,
      discussionTitle: discussion.title || "Rasprava",
      discussionBody: discussion.body || "",
      buildingId: discussion.buildingId || null,
    });
  } catch (err) {
    return next(err);
  }
});

app.get("/health", (_req, res) => {
    res.status(200).json({status: "ok", uptime: process.uptime() })
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});

