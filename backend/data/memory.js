import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export const db = {
  users: [],
  buildings: [],
  memberships: [],
  discussions: [],
  discussionParticipants: [],
  messages: [],
  votes: [],
};

function createBuilding(name, address) {
  const b = { id: nanoid(), name, address };
  db.buildings.push(b);
  return b;
}

async function createUser(email, role, password, firstName, lastName) {
  const passHash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), email, role, passHash, firstName, lastName };
  db.users.push(user);
  return user;
}


export async function seed() {
  if (db.users.length) return;
  await createUser("admin@demo.hr", "admin",       "admin123", "Admin", "A");

  createBuilding("Zgrada A", "Ulica 1, Zagreb");
  createBuilding("Zgrada B", "Ulica 2, Zagreb");
}
