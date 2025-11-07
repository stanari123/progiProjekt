import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { getRoleInBuilding } from "./buildingsService.js";
import { assertDiscussion } from "./discussionsService.js";

export function castVote(discussionId, userId, value) {
  if (!["yes", "no"].includes(value)) {
    throw new AppError("value mora biti 'yes' ili 'no'", 400);
  }

  const d = assertDiscussion(discussionId);
  if (d.status === "closed") {
    throw new AppError("Rasprava je zatvorena", 400);
  }

  const roleInB = getRoleInBuilding(userId, d.buildingId);
  if (!roleInB) throw new AppError("Niste član ove zgrade", 403);
  if (roleInB === "admin") throw new AppError("Admin ne može glasati", 403);

  const idx = db.votes.findIndex(v => v.discussionId === discussionId && v.userId === userId);
  if (idx >= 0) {
    const current = db.votes[idx].value;
    if (current === value) {
      db.votes.splice(idx, 1);
      return { status: "cleared" };
    } else {
      db.votes[idx].value = value;
      return { status: "updated" };
    }
  } else {
    db.votes.push({ discussionId, userId, value, roleInBuilding: roleInB });
    return { status: "created" };
  }
}
export function getVoteSummary(discussionId, userId) {
  const d = assertDiscussion(discussionId);

  const totalOwners = db.memberships.filter(
    m => m.buildingId === d.buildingId && m.roleInBuilding === "suvlasnik"
  ).length || 1;

  const allVotes = db.votes.filter(v => v.discussionId === discussionId);
  const ownerVotes = allVotes.filter(v => {
    if (v.roleInBuilding) return v.roleInBuilding === "suvlasnik";
    const m = db.memberships.find(
      m => m.userId === v.userId && m.buildingId === d.buildingId
    );
    return m?.roleInBuilding === "suvlasnik";
  });

  const yes = ownerVotes.filter(v => v.value === "yes").length;
  const no  = ownerVotes.filter(v => v.value === "no").length;

  const thresholdReached = yes > totalOwners / 4;
  const mine = allVotes.find(v => v.userId === userId)?.value || null;

  return {
    total: ownerVotes.length,
    yes,
    no,
    totalOwners,
    thresholdReached,
    currentUserVote: mine,
  };
}
