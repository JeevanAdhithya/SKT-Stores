import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";
import { ref, get, set, update, runTransaction } from "firebase/database";
import { getAuthInstance, getDB } from "./firebase";
import type { UserProfile } from "./types";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function validateUsername(u: string): string | null {
  if (!USERNAME_RE.test(u)) return "Username: 3–20 chars, a–z, 0–9, _";
  return null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const snap = await get(ref(getDB(), "usernames/" + username));
  return !snap.exists();
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

  // Reserve username via transaction (best-effort pre-check first)
  if (!(await isUsernameAvailable(username))) {
    throw new Error("Username is already taken");
  }

  const cred = await createUserWithEmailAndPassword(
    getAuthInstance(),
    input.email.trim(),
    input.password,
  );
  const uid = cred.user.uid;

  // Claim username atomically
  const tx = await runTransaction(ref(getDB(), "usernames/" + username), (cur) => {
    if (cur === null) return uid;
    return; // abort
  });
  if (!tx.committed) {
    // Roll back the auth user — username got claimed
    try {
      await cred.user.delete();
    } catch {}
    throw new Error("Username is already taken");
  }

  const profile: UserProfile = {
    uid,
    name: input.name.trim(),
    username,
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: "",
    city: "",
    pincode: "",
    createdAt: new Date().toISOString(),
  };
  await set(ref(getDB(), "users/" + uid), profile);
  return profile;
}

export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(getAuthInstance(), email.trim(), password);
}

export async function signInWithUsername(username: string, password: string) {
  const u = username.trim().toLowerCase();
  const snap = await get(ref(getDB(), "usernames/" + u));
  if (!snap.exists()) throw new Error("No account with that username");
  const uid = snap.val() as string;
  const profSnap = await get(ref(getDB(), "users/" + uid + "/email"));
  const email = profSnap.val() as string | null;
  if (!email) throw new Error("Account is missing email; sign in with email instead");
  await signInWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getAuthInstance(), email.trim());
}

export async function signOut() {
  await fbSignOut(getAuthInstance());
}

export async function updateProfile(uid: string, patch: Partial<UserProfile>) {
  await update(ref(getDB(), "users/" + uid), patch);
}

export async function changePassword(user: User, currentPwd: string, newPwd: string) {
  if (!user.email) throw new Error("No email on account");
  const cred = EmailAuthProvider.credential(user.email, currentPwd);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPwd);
}
