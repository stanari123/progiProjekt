import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import {
    userCanAccessDiscussion,
    buildDisplayName,
    assertDiscussion,
} from "./discussionsService.js";

export async function listMessagesForUser(discussionId, authUser) {
    const d = await assertDiscussion(discussionId);

    if (!(await userCanAccessDiscussion(d, authUser))) {
        throw new AppError("Nemate pristup ovoj raspravi", 403);
    }

    const { data: raw, error } = await db
        .from("message")
        .select("*")
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true });

    if (error || !raw) throw new AppError("Greška pri dohvaćanju poruka", 500);

    let data = [];

    for (const msg of raw) {
        const { data: author } = await db
            .from("app_user")
            .select("*")
            .eq("id", msg.author_id)
            .single();

        data.push({
            id: msg.id,
            body: msg.body,
            createdAt: msg.created_at,
            authorId: msg.author_id,
            authorName: author.first_name + " " + author.last_name,
            authorEmail: author.email,
        });
    }

    return data;
}

export async function addMessageToDiscussion(discussionId, authUser, body) {
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
        .select()
        .single();

    if (insertError || !inserted) throw new AppError("Greška pri spremanju poruke", 500); // <-- ADD error check

    return {
        id: inserted.id,
        body: inserted.body,
        createdAt: inserted.created_at,
        authorId: inserted.author_id,
        authorName: buildDisplayName(user),
        authorEmail: user.email,
    };
}
