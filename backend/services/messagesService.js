import { nanoid } from "nanoid";
import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import {
    userCanAccessDiscussion,
    buildDisplayName,
    assertDiscussion,
} from "./discussionsService.js";

export async function listMessagesForUser(discussionId, authUser) {
    const d = assertDiscussion(discussionId);

    if (!userCanAccessDiscussion(d, authUser)) {
        throw new AppError("Nemate pristup ovoj raspravi", 403);
    }

    const { data: raw, error } = await db
        .from("message")
        .select("*")
        .eq("discussion_id", discussionId);

    if (error || !raw) throw new AppError("Greška pri dohvaćanju poruka", 500);

    return Promise.all(
        raw.map(async (m) => {
            const { data: u, error: userError } = await db
                .from("app_user")
                .select("*")
                .eq("id", m.author_id)
                .single();

            if (userError) throw new AppError("Greška pri dohvaćanju autora", 500);

            return {
                ...m,
                authorName: buildDisplayName(u),
            };
        })
    );
}

export async function addMessageToDiscussion(discussionId, authUser, body) {
    console.log(
        "Adding message to discussion:",
        discussionId,
        "by user:",
        authUser,
        "with body:",
        body
    );
    const d = assertDiscussion(discussionId);

    const trimmed = (body || "").trim();
    if (!trimmed) throw new AppError("Sadržaj poruke je obavezan", 400);

    const { data: user, error: userError } = await db
        .from("app_user")
        .select("*")
        .eq("email", authUser.email)
        .single();

    if (userError || !user) throw new AppError("Autor mora postojati!", 400);

    const { data: inserted, error: insertError } = await db
        .from("message")
        .insert({
            discussion_id: discussionId,
            author_id: user.id,
            body: trimmed,
        })
        .single();

    return {
        ...inserted,
        authorName: buildDisplayName(user),
    };
}
