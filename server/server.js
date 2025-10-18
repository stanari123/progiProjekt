import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"..", "views"))

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (_req, res) => {
    res.render("index");
});

app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});
