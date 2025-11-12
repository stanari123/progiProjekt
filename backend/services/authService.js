import bcrypt from "bcryptjs";
import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { issueToken } from "../middleware/auth.js";
import { findUserByEmail } from "./adminService.js";

// login — vraća token i user info
export async function loginUser(email, password) {
    const user = await findUserByEmail(email);

    if (!user) throw new AppError("Neispravni podaci", 401);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new AppError("Neispravni podaci", 401);

    const token = issueToken(user);
    return {
        token,
        user: {
            email: user.email,
            role: user.role,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
        },
    };
}

//info o aktivnom useru
export async function getMe(reqUser) {
    const { data: user } = await db
        .from("app_user")
        .select("*")
        .eq("email", reqUser.email)
        .maybeSingle();

    if (!user) {
        throw new AppError("Korisnik nije pronađen", 404);
    }

    return {
        email: user.email,
        role: user.role,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
    };
}

// google login
export async function loginWithGoogleProfile(googleUser) {
  if (!googleUser || !googleUser.email) {
    throw new AppError("Nedostaje email iz Google profila", 400);
  }

  const email = googleUser.email.toLowerCase();

  //googleStrategy je handleao da postoji
  const { data: user, error } = await db
    .from("app_user")
    .select("id, email, role, first_name, last_name")
    .eq("email", email)
    .maybeSingle();

  if (error || !user) {
    throw new AppError("Korisnik nije pronađen nakon Google prijave", 404);
  }

  const token = issueToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
    },
  };
}
