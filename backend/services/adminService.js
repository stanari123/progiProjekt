import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";

export class User {
    constructor(firstName, lastName, email, role, password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.password = password;
    }
}

export async function findUserByEmail(email = "") {
    const lowercaseEmail = email.toLowerCase();
    const { data, error } = await db
        .from("app_user")
        .select("*")
        .eq("email", lowercaseEmail)
        .single();

    if (!data) return null;

    return new User(
        data.first_name,
        data.last_name,
        data.email,
        data.role,
        data.password_hash
    );
}

async function addMembership(userId, buildingId, roleInBuilding) {
    const membershipExists = await db
        .from("building_membership")
        .select("*")
        .eq("user_id", userId)
        .eq("building_id", buildingId)
        .single();

    if (!membershipExists) {
        await db.from("building_membership").insert({
            building_id: buildingId,
            user_id: userId,
            role: roleInBuilding,
        });
    }
}

export async function createUser(currentUser, newUser) {
    if (!currentUser || (currentUser.role || "").toLowerCase() !== "admin") {
        throw new AppError("Samo admin može kreirati korisnike.", 403);
    }

    if (!newUser.email || !newUser.password) {
        throw new AppError("E-pošta i lozinka su obavezni.", 400);
    }

    // TODO: dodati provjeru za stanara i zgradu u kojoj zivi

    const { data: existing } = await db
        .from("app_user")
        .select("*")
        .eq("email", newUser.email)
        .single();

    if (existing) {
        console.log("User with this email already exists:", existing);
        throw new AppError("Korisnik s tom e-poštom već postoji.", 409);
    }

    const passHash = await bcrypt.hash(newUser.password, 10);
    const user = new User(
        newUser.firstName,
        newUser.lastName,
        newUser.email,
        newUser.role,
        passHash
    );

    const { data, error } = await db.from("app_user").insert({
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        password_hash: user.password,
        role: user.role,
    });

    return user;
}
