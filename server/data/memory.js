import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export const db = {
  users: [],
  discussions: [],
  messages: [],
  votes: [],
};

export async function seed() {
  if (db.users.length) return;
  db.users.push({
    id: nanoid(),
    email: "suvlasnik@demo.hr",
    role: "suvlasnik",
    passHash: await bcrypt.hash("pass123", 10),
  });
  console.log("✅ seed: default user suvlasnik@demo.hr (pass123)");
}