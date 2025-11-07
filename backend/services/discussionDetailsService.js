import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { getRoleInBuilding,userInBuilding,listMembers,} from "./buildingsService.js";
import { getActivePoll } from "./pollService.js";
import { buildDisplayName,userCanAccessDiscussion,assertDiscussion,} from "./discussionsService.js";


export function getDiscussionById(id, authUser) {
  const d = assertDiscussion(id);

  if (authUser.role !== "admin" && !userInBuilding(authUser.sub, d.buildingId)) {
    throw new AppError("Zabranjen pristup diskusiji", 403);
  }

  const roleInB = getRoleInBuilding(authUser.sub, d.buildingId);
  const isOwner = d.ownerId === authUser.sub;

  const canModerate =
    authUser.role === "admin" || isOwner;

  const canViewContent = userCanAccessDiscussion(d, authUser);

  const owner = db.users.find((u) => u.id === d.ownerId);
  const ownerName = d.ownerName || buildDisplayName(owner);

  let participants = [];
  if (d.isPrivate) {
    participants = db.discussionParticipants
      .filter((p) => p.discussionId === d.id)
      .map((p) => {
        const u = db.users.find((x) => x.id === p.userId);
        return {
          userId: p.userId,
          name: u ? buildDisplayName(u) : p.userId,
          canPost: p.canPost !== false,
        };
      });
  }

  const activePoll = getActivePoll(d.id);
  const poll =
    canViewContent && activePoll && activePoll.poll
      ? {
          id: activePoll.id,
          question: activePoll.poll.question,
          active: activePoll.poll.active !== false,
          createdAt: activePoll.createdAt,
        }
      : null;

  let addableMembers = [];
  const canEditParticipants = authUser.role === "admin" || isOwner;

  if (canEditParticipants && d.isPrivate) {
    const buildingMembers = listMembers(d.buildingId, authUser);
    const currentIds = new Set(participants.map((p) => p.userId));

    addableMembers = buildingMembers
      .filter((m) => {
        const isAlready = currentIds.has(m.userId);
        const isOwner2 = m.userId === d.ownerId;
        const isAdmin2 =
          (m.roleInBuilding || m.role || "").toLowerCase() === "admin";
        return !isAlready && !isOwner2 && !isAdmin2;
      })
      .map((m) => ({
        userId: m.userId,
        name:
          [m.firstName, m.lastName].filter(Boolean).join(" ") ||
          m.email ||
          m.userId,
        roleInBuilding: m.roleInBuilding || "suvlasnik",
      }));
  }

  return {
    ...d,
    ownerName,
    canModerate,
    canViewContent,
    body: canViewContent ? d.body : "",
    participants,
    poll,
    addableMembers,
  };
}

export function closeDiscussion(id, authUser) {
  const d = assertDiscussion(id);
  const roleInB = getRoleInBuilding(authUser.sub, d.buildingId);
  const isOwner = d.ownerId === authUser.sub;

  if (!(authUser.role === "admin" || roleInB === "predstavnik" || isOwner)) {
    throw new AppError(
      "Samo predstavnik, admin ili inicijator može zatvoriti raspravu",
      403
    );
  }
  d.status = "closed";
  return d;
}

export function reopenDiscussion(id, authUser) {
  const d = assertDiscussion(id);
  const roleInB = getRoleInBuilding(authUser.sub, d.buildingId);
  const isOwner = d.ownerId === authUser.sub;

  if (!(authUser.role === "admin" || roleInB === "predstavnik" || isOwner)) {
    throw new AppError(
      "Samo predstavnik, admin ili inicijator može otvoriti raspravu",
      403
    );
  }
  d.status = "open";
  return d;
}

export function setDiscussionParticipants(
  discussionId,
  authUser,
  participants
) {
  const d = assertDiscussion(discussionId);
  const isOwner = d.ownerId === authUser.sub;
  const canEdit = authUser.role === "admin" || isOwner;

  if (!canEdit) {
    throw new AppError("Nemate ovlasti za uređivanje sudionika", 403);
  }
  const list = Array.isArray(participants) ? participants : [];

  if (!list.includes(d.ownerId)) {
    list.push(d.ownerId);
  }

  db.discussionParticipants = db.discussionParticipants.filter(
    (p) => p.discussionId !== discussionId
  );

  for (const userId of list) {
    const u = db.users.find((x) => x.id === userId);
    if (u && u.role === "admin") {
      continue;
    }
    db.discussionParticipants.push({
      discussionId,
      userId,
      canPost: true,
    });
  }

  return {
    id: d.id,
    isPrivate: d.isPrivate,
    participants: db.discussionParticipants
      .filter((p) => p.discussionId === discussionId)
      .map((p) => ({ userId: p.userId, canPost: p.canPost })),
  };
}
