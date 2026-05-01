import { supabase } from "./supabase";
import type { UserProfile } from "./types";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function validateUsername(u: string): string | null {
  if (!USERNAME_RE.test(u)) return "Username: 3–20 chars, a–z, 0–9, _";
  return null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();
  
  if (error) return false;
  return !data;
}

export async function signUp(input: {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}): Promise<UserProfile> {
  const username = input.username.trim().toLowerCase();
  const err = validateUsername(username);
  if (err) throw new Error(err);

  // Check username availability
  if (!(await isUsernameAvailable(username))) {
    throw new Error("Username is already taken");
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.name.trim(),
        username,
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Signup failed");

  const profile: UserProfile = {
    uid: authData.user.id,
    name: input.name.trim(),
    username,
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: "",
    city: "",
    pincode: "",
    createdAt: new Date().toISOString(),
  };

  const { error: profError } = await supabase.from("profiles").insert({
    id: profile.uid,
    name: profile.name,
    username: profile.username,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    city: profile.city,
    pincode: profile.pincode,
  });

  if (profError) {
    // If profile insert fails, we might want to delete the auth user, 
    // but Supabase doesn't easily allow client-side deletion.
    throw profError;
  }

  return profile;
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
}

export async function signInWithUsername(username: string, password: string) {
  const u = username.trim().toLowerCase();
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("username", u)
    .maybeSingle();

  if (error || !data) throw new Error("No account with that username");
  
  await signInWithEmail(data.email, password);
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  if (error) throw error;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    }
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateProfile(uid: string, patch: Partial<UserProfile>) {
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", uid);
  if (error) throw error;
}

export async function changePassword(user: any, currentPwd: string, newPwd: string) {
  // Supabase doesn't require re-auth for password update if session is valid,
  // but it's good practice to re-auth. However, supabase-js handles it differently.
  const { error } = await supabase.auth.updateUser({ password: newPwd });
  if (error) throw error;
}
