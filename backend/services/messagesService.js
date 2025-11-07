import { nanoid } from "nanoid";
import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { userCanAccessDiscussion,buildDisplayName,assertDiscussion,} from "./discussionsService.js";



export function listMessagesForUser(discussionId, authUser) {
  const d = assertDiscussion(discussionId);

  if (!userCanAccessDiscussion(d, authUser)) {
    throw new AppError("Nemate pristup ovoj raspravi", 403);
  }

  const raw = db.messages.filter(
    (m) => m.discussionId === discussionId && m.type !== "poll"
  );
  return raw.map((m) => {
    const u = db.users.find((x) => x.id === m.authorId) || null;
    return {
      ...m,
      authorName: buildDisplayName(u),
    };
  });
}
export function addMessageToDiscussion(discussionId, authUser, body) {
  const d = assertDiscussion(discussionId);

  if (!userCanAccessDiscussion(d, authUser)) {
    throw new AppError("Nemate pristup ovoj raspravi", 403);
  }

  if (d.status === "closed") {
    throw new AppError("Rasprava je zatvorena", 400);
  }

  const trimmed = (body || "").trim();
  if (!trimmed) throw new AppError("Sadržaj poruke je obavezan", 400);

  const msg = {
    id: nanoid(),
    discussionId,
    authorId: authUser.sub,
    body: trimmed,
    type: "text",
    createdAt: new Date().toISOString(),
  };

  db.messages.push(msg);
  const u = db.users.find((x) => x.id === authUser.sub) || null;
  return {
    ...msg,
    authorName: buildDisplayName(u),
  };
}
