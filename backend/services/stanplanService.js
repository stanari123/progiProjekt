import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { assertDiscussion } from "./discussionsService.js";
import { getActivePoll } from "./pollService.js";
import { getVoteSummary } from "./votesService.js";
import { getBuildingForUser, getRoleInBuilding } from "./buildingsService.js";
import { getStanPlanLink } from "./stanplanConfigService.js";

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

function assertValidIsoDatetime(datetime) {
    if (!datetime || typeof datetime !== "string") {
        throw new AppError("datetime je obavezan", 400);
    }
    const dt = new Date(datetime);
    if (Number.isNaN(dt.getTime())) {
        throw new AppError("Neispravan datetime", 400);
    }
    return dt;
}

// Kreiranje sastanka na StanPlan serveru
export async function createMeetingFromDiscussion(discussionId, datetime, authUser) {

    if (!discussionId) throw new AppError("discussionId je obavezan", 400);
    const dt = assertValidIsoDatetime(datetime);

    const d = await assertDiscussion(discussionId);

    const userId = authUser?.sub || authUser?.id;
    if (!userId) throw new AppError("Neispravan token", 401);

    const roleInBuilding = await getRoleInBuilding(userId, d.building_id);
    if (roleInBuilding !== "predstavnik") {
        throw new AppError("Samo predstavnik te zgrade može sazvati sastanak", 403);
    }

    const poll = await getActivePoll(d.id);
    if (!poll) throw new AppError("Nema aktivne ankete", 400);

    const summary = await getVoteSummary(poll.id, authUser);
    if (!summary?.thresholdReached) {
        throw new AppError("Prag pozitivnih glasova nije dosegnut", 400);
    }

    const building = await getBuildingForUser(d.building_id, authUser);
    const mjesto = [building?.name, building?.address].filter(Boolean).join(", ");

    const { link } = await getStanPlanLink();
    const endpoint = (link || "").trim().replace(/\/$/, "") + "/api/meetings/create";
    if (!endpoint) throw new AppError("StanPlan link nije postavljen", 500);

    // payload: naslov, opis, pitanje (iz ankete), mjesto, vrijeme
    const payload = {
        naslov: d.title || "Sastanak",
        opis: d.poll_description || "",
        pitanje: poll?.question || "",
        mjesto,
        vrijeme: dt.toISOString(),
    };


    let resp;
    try {
        resp = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch (e) {
        console.error("StanPlan fetch error:", e);
        throw new AppError("Greška pri komunikaciji sa StanPlan serverom", 502);
    }

    const text = await resp.text().catch(() => "");
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!resp.ok) {
        const msg =
            (data && typeof data === "object" && (data.error || data.message)) ||
            `StanPlan error (${resp.status})`;
        throw new AppError(msg, 502);
    }

    return { ok: true, stanplan: data };
}


