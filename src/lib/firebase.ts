// Firebase singletons — pre-configured for SKT Stores.
// All access goes through getDB() / getAuthInstance() so SSR never touches window/IndexedDB.
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { getAuth as fbGetAuth, type Auth } from "firebase/auth";

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

let app: FirebaseApp | null = null;
let db: Database | null = null;
let auth: Auth | null = null;

function getApp(): FirebaseApp {
  if (typeof window === "undefined") throw new Error("Firebase is client-only");
  if (!app) app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);
  return app;
}

export function getDB(): Database {
  if (!db) db = getDatabase(getApp());
  return db;
}

export function getAuthInstance(): Auth {
  if (!auth) auth = fbGetAuth(getApp());
  return auth;
}
