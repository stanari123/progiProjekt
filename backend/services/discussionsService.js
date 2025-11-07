import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { nanoid } from "nanoid";
import { userInBuilding } from "./buildingsService.js";

// helpers
export function buildDisplayName(user) {
  if (!user) return "(nepoznat)";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (full) return full;
  if (user.role === "admin") return "Administrator";
  return user.email || "(nepoznat)";
}
export function userCanAccessDiscussion(discussion, authUser) {
  if (!discussion.isPrivate) return true;

  if (authUser.role === "admin") return true;

  if (discussion.ownerId === authUser.sub) return true;

  const isParticipant = db.discussionParticipants.some(
    (p) => p.discussionId === discussion.id && p.userId === authUser.sub
  );
  return isParticipant;
}
export function assertDiscussion(id) {
  const d = db.discussions.find((x) => x.id === id);
  if (!d) throw new AppError("Diskusija nije pronađena", 404);
  return d;
}


/**/
export function listDiscussions(authUser, buildingId) {
  if (!buildingId) throw new AppError("buildingId je obavezan", 400);

  if (authUser.role !== "admin" && !userInBuilding(authUser.sub, buildingId)) {
    throw new AppError("Zabranjen pristup zgradi", 403);
  }

  return db.discussions
    .filter((d) => d.buildingId === buildingId)
    .map((d) => {
      const owner = db.users.find((u) => u.id === d.ownerId);
      const canViewContent = userCanAccessDiscussion(d, authUser);
      return {
        ...d,
        ownerName: d.ownerName || buildDisplayName(owner),
        canViewContent,
        body: canViewContent ? d.body : "",
      };
    });
}
export function createDiscussion(
  authUser,
  buildingId,
  title,
  body = "",
  isPrivate = false
) {
  if (!title) throw new AppError("Naslov je obavezan", 400);
  if (!buildingId) throw new AppError("buildingId je obavezan", 400);

  if (authUser.role !== "admin" && !userInBuilding(authUser.sub, buildingId)) {
    throw new AppError("Zabranjen pristup zgradi", 403);
  }

  const realUser =
    db.users.find((u) => u.id === authUser.sub) || {
      id: authUser.sub,
      email: authUser.email,
      role: authUser.role,
    };

  const d = {
    id: nanoid(),
    buildingId,
    title,
    body,
    isPrivate,
    status: "open",
    ownerId: realUser.id,
    ownerName: buildDisplayName(realUser),
    createdAt: new Date().toISOString(),
  };

  db.discussions.push(d);

  if (isPrivate) {
    db.discussionParticipants.push({
      discussionId: d.id,
      userId: realUser.id,
      canPost: true,
    });
  }

  return d;
}
