import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";

function getStanPlanRowId() {
  const id = process.env.STANPLAN_LINK_ROW_ID;
  if (!id) throw new AppError("STANPLAN_LINK_ROW_ID nije postavljen", 500);
  return id;
}

export async function getStanPlanLink() {
  const rowId = getStanPlanRowId();

  const { data, error } = await db
    .from("stanplan")
    .select("link")
    .eq("id", rowId)
    .maybeSingle();

  if (error) throw new AppError(error.message || "Greška pri dohvaćanju StanPlan linka", 500);

  return { link: data?.link || "" };
}

export async function setStanPlanLink(link) {
  const rowId = getStanPlanRowId();

  if (!link || typeof link !== "string") throw new AppError("Neispravan link", 400);

  const trimmed = link.trim();
  if (!trimmed) throw new AppError("Neispravan link", 400);

  const { data, error } = await db
    .from("stanplan")
    .upsert({ id: rowId, link: trimmed }, { onConflict: "id" })
    .select("link")
    .single();

  if (error) throw new AppError(error.message || "Greška pri spremanju StanPlan linka", 500);

  return { link: data?.link ?? trimmed };
}
