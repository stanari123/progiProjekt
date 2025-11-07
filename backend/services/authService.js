import bcrypt from "bcryptjs";
import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { issueToken } from "../middleware/auth.js";

// login — vraća token i user info
export async function loginUser(email, password) {
  const user = db.users.find(u => u.email === email);
  if (!user) throw new AppError("Neispravni podaci", 401);

  const ok = await bcrypt.compare(password, user.passHash);
  if (!ok) throw new AppError("Neispravni podaci", 401);

  const token = issueToken(user);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    },
  };
}

//info o aktivnom useru
export function getMe(userId) {
  const u = db.users.find(x => x.id === userId);
  if (!u) throw new AppError("Korisnik nije pronađen", 404);

  return {
    id: u.id,
    email: u.email,
    role: u.role,
    firstName: u.firstName || "",
    lastName: u.lastName || "",
  };
}
