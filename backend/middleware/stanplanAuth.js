import { AppError } from "../utils/AppError.js";

export function stanplanAuth(req, res, next) {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    throw new AppError("Nedostaje API ključ", 401);
  }

  if (apiKey !== process.env.STANPLAN_API_KEY) {
    throw new AppError("Neispravan API ključ", 403);
  }

  next();
}
