import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";

async function getBuildingIdByName(buildingName) {
  const { data, error } = await db
    .from("building")
    .select("id")
    .eq("name", buildingName)
    .maybeSingle();

  if (error) {
    throw new AppError(
      error.message || "Greška pri dohvaćanju zgrade",
      500
    );
  }

  return data ? data.id : null;
}

async function getLatestPollForDiscussion(discussionId) {
  const { data, error } = await db
    .from("poll")
    .select("id, question, created_at")
    .eq("discussion_id", discussionId)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (error) throw new AppError(error.message || "Greška pri dohvaćanju ankete", 500);
  return data || null;
}

async function getOwnersCount(buildingId) {
  const { count, error } = await db
    .from("building_membership")
    .select("user_id", { count: "exact", head: true })
    .eq("building_id", buildingId)
    .eq("user_role", "suvlasnik");

  if (error) throw new AppError(error.message || "Greška pri dohvaćanju suvlasnika", 500);
  return count || 0;
}

async function countYesVotes(pollId) {
  const { count, error } = await db
    .from("vote")
    .select("id", { count: "exact", head: true })
    .eq("poll_id", pollId)
    .eq("value", "da");

  if (error) throw new AppError(error.message || "Greška pri dohvaćanju glasova", 500);
  return count || 0;
}

export async function listPositiveOutcomeDiscussions(buildingName = null) {
  let buildingId = null;

  if (buildingName) {
    buildingId = await getBuildingIdByName(buildingName);
    if (!buildingId) return [];
  }

  let dQ = db
    .from("discussion")
    .select("id, title, poll_description, created_at, building_id");

  if (buildingId) dQ = dQ.eq("building_id", buildingId);

  const { data: discussions, error } = await dQ;
  if (error) throw new AppError(error.message || "Greška pri dohvaćanju diskusija", 500);

  const ownersCountCache = new Map();
  const out = [];

  for (const d of discussions || []) {
    const poll = await getLatestPollForDiscussion(d.id);
    if (!poll) continue;

    if (!d.building_id) continue;

    let ownersCount = ownersCountCache.get(d.building_id);
    if (ownersCount == null) {
      ownersCount = await getOwnersCount(d.building_id);
      ownersCountCache.set(d.building_id, ownersCount);
    }

    const yesVotes = await countYesVotes(poll.id);

    if (yesVotes > ownersCount / 4) {
      out.push({
        title: d.title,
        description: d.poll_description || "",
        createdAt: d.created_at,
        link: `/discussions/${d.id}`,
        question: poll.question,
      });
    }
  }

  return out;
}
