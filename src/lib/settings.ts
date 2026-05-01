import { supabase } from "./supabase";
import type { StoreSettings } from "./types";

export async function getStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return { upi_id: "", qr_url: "" };
  }

  return {
    upi_id: data.upi_id || "",
    qr_url: data.qr_url || "",
  };
}

export async function updateStoreSettings(settings: Partial<StoreSettings>) {
  const { error } = await supabase
    .from("store_settings")
    .update(settings)
    .eq("id", 1);
  
  if (error) throw error;
}
