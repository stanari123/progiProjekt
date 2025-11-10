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
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
        },
    };
}

//info o aktivnom useru
export async function getMe(userId) {
    const { data: user } = await db
        .from("app_user")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (!user) {
        throw new AppError("Korisnik nije pronađen", 404);
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
    };
}
