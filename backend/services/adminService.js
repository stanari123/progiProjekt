import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";

function findUserByEmail(email = "") {
  const lower = email.toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === lower);
}
function addMembership(userId, buildingId, roleInBuilding) {
  const exists = db.memberships.some(
    (m) => m.userId === userId && m.buildingId === buildingId
  );
  if (!exists) {
    db.memberships.push({ userId, buildingId, roleInBuilding });
  }
}

export async function createUser(currentUser, payload) {
  if (!currentUser || (currentUser.role || "").toLowerCase() !== "admin") {
    throw new AppError("Samo admin može kreirati korisnike.", 403);
  }

  const {
    firstName = "",
    lastName = "",
    email,
    password,
    role = "suvlasnik",
    buildingIds = [],
  } = payload || {};

  if (!email || !password) {
    throw new AppError("E-pošta i lozinka su obavezni.", 400);
  }

  const existing = findUserByEmail(email);
  if (existing) {
    throw new AppError("Korisnik s tom e-poštom već postoji.", 409);
  }

  const passHash = await bcrypt.hash(password, 10);

  const user = {
    id: nanoid(),
    email,
    role,
    passHash,
    firstName,
    lastName,
  };

  db.users.push(user);

  if (Array.isArray(buildingIds)) {
    for (const bId of buildingIds) {
      if (!bId) continue;
      const existsBuilding = db.buildings.some((b) => b.id === bId);
      if (!existsBuilding) continue;
      addMembership(user.id, bId, user.role);
    }
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}