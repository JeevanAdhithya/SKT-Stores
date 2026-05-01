import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signUp, signInWithEmail, signInWithUsername, resetPassword, validateUsername } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SKT Stores" },
      { name: "description", content: "Sign in or create your SKT Stores account." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";
type SigninMode = "email" | "username";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // signin
  const [signinMode, setSigninMode] = useState<SigninMode>("email");
  const [si_id, setSiId] = useState("");
  const [si_pwd, setSiPwd] = useState("");

  // signup
  const [su_name, setSuName] = useState("");
  const [su_user, setSuUser] = useState("");
  const [su_email, setSuEmail] = useState("");
  const [su_phone, setSuPhone] = useState("");
  const [su_pwd, setSuPwd] = useState("");
  const [su_pwd2, setSuPwd2] = useState("");

  // forgot
  const [fp_email, setFpEmail] = useState("");

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!si_id.trim() || !si_pwd) return setErr("Please fill all fields");
    setBusy(true);
    try {
      if (signinMode === "email") await signInWithEmail(si_id, si_pwd);
      else await signInWithUsername(si_id, si_pwd);
      navigate({ to: "/" });
    } catch (e2) {
      setErr(prettyError(e2));
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!su_name.trim()) return setErr("Enter your full name");
    const uErr = validateUsername(su_user.trim().toLowerCase());
    if (uErr) return setErr(uErr);
    if (!/\S+@\S+\.\S+/.test(su_email)) return setErr("Enter a valid email");
    if (!su_phone.trim() || su_phone.replace(/\D/g, "").length < 10)
      return setErr("Enter a valid phone number");
    if (su_pwd.length < 8) return setErr("Password must be at least 8 characters");
    if (su_pwd !== su_pwd2) return setErr("Passwords do not match");
    setBusy(true);
    try {
      await signUp({
        name: su_name, username: su_user, email: su_email,
        phone: su_phone, password: su_pwd,
      });
      navigate({ to: "/" });
    } catch (e2) {
      setErr(prettyError(e2));
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!/\S+@\S+\.\S+/.test(fp_email)) return setErr("Enter a valid email");
    setBusy(true);
    try {
      await resetPassword(fp_email);
      setMsg("Reset link sent! Check your inbox.");
    } catch (e2) {
      setErr(prettyError(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-background">
      {/* Brand panel — full width on mobile (compact), side panel on desktop */}
      <div
        className="md:w-1/2 md:min-h-dvh flex flex-col justify-center items-center text-white p-8 md:p-12"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-sm text-center md:text-left">
          <div className="text-4xl md:text-6xl font-black tracking-tight">SKT Stores</div>
          <div className="text-sm md:text-lg text-white/80 mt-2 mb-4 md:mb-8">
            Fresh food · Fast ordering
          </div>
          <ul className="hidden md:block space-y-3 text-white/90 text-base">
            <li>🛒 Browse a curated menu</li>
            <li>📦 Track every order live</li>
            <li>🚚 Doorstep delivery</li>
            <li>👤 Save your details for next time</li>
          </ul>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-5 md:p-10">
        <div
          className="bg-surface rounded-[20px] p-6 md:p-8 w-full max-w-[420px]"
          style={{ boxShadow: "0 10px 40px oklch(0 0 0 / 0.08)" }}
        >
          {mode !== "forgot" && (
            <div className="flex bg-surface-muted rounded-[11px] p-1 mb-6">
              <button
                onClick={() => { setMode("signin"); setErr(""); setMsg(""); }}
                className={`flex-1 py-2.5 rounded-[8px] text-sm font-extrabold transition ${
                  mode === "signin" ? "bg-surface text-brand shadow-sm" : "text-muted-text"
                }`}
              >Sign In</button>
              <button
                onClick={() => { setMode("signup"); setErr(""); setMsg(""); }}
                className={`flex-1 py-2.5 rounded-[8px] text-sm font-extrabold transition ${
                  mode === "signup" ? "bg-surface text-brand shadow-sm" : "text-muted-text"
                }`}
              >Sign Up</button>
            </div>
          )}

          {mode === "signin" && (
            <form onSubmit={handleSignin} className="space-y-3">
              <h2 className="text-2xl font-extrabold mb-1">Welcome back 👋</h2>
              <p className="text-sm text-muted-text mb-4">Sign in to continue ordering</p>

              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setSigninMode("email")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                    signinMode === "email" ? "bg-brand text-brand-fg border-brand" : "bg-transparent border-line text-muted-text"
                  }`}>Email</button>
                <button type="button" onClick={() => setSigninMode("username")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                    signinMode === "username" ? "bg-brand text-brand-fg border-brand" : "bg-transparent border-line text-muted-text"
                  }`}>Username</button>
              </div>

              <Input
                type={signinMode === "email" ? "email" : "text"}
                placeholder={signinMode === "email" ? "Email address" : "Username"}
                value={si_id} onChange={(v) => setSiId(v)}
                autoComplete={signinMode === "email" ? "email" : "username"}
              />
              <Input type="password" placeholder="Password" value={si_pwd}
                onChange={(v) => setSiPwd(v)} autoComplete="current-password" />

              <button type="button" onClick={() => { setMode("forgot"); setErr(""); setMsg(""); }}
                className="text-xs text-brand font-bold hover:underline block">
                Forgot password?
              </button>

              {err && <Alert kind="err">{err}</Alert>}
              <Submit busy={busy}>Sign In</Submit>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-3">
              <h2 className="text-2xl font-extrabold mb-1">Create account ✨</h2>
              <p className="text-sm text-muted-text mb-4">Join SKT Stores in under a minute</p>
              <Input type="text" placeholder="Full name" value={su_name} onChange={setSuName} autoComplete="name" />
              <Input type="text" placeholder="Username (a-z, 0-9, _)" value={su_user}
                onChange={(v) => setSuUser(v.toLowerCase())} autoComplete="username" />
              <Input type="email" placeholder="Email" value={su_email} onChange={setSuEmail} autoComplete="email" />
              <Input type="tel" placeholder="Phone number" value={su_phone} onChange={setSuPhone} autoComplete="tel" />
              <Input type="password" placeholder="Password (min 8 chars)" value={su_pwd}
                onChange={setSuPwd} autoComplete="new-password" />
              <Input type="password" placeholder="Confirm password" value={su_pwd2}
                onChange={setSuPwd2} autoComplete="new-password" />
              {err && <Alert kind="err">{err}</Alert>}
              <Submit busy={busy}>Create Account</Submit>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-3">
              <h2 className="text-2xl font-extrabold mb-1">Reset password</h2>
              <p className="text-sm text-muted-text mb-4">
                Enter your email and we'll send you a reset link.
              </p>
              <Input type="email" placeholder="Email address" value={fp_email}
                onChange={setFpEmail} autoComplete="email" />
              {err && <Alert kind="err">{err}</Alert>}
              {msg && <Alert kind="ok">{msg}</Alert>}
              <Submit busy={busy}>Send reset link</Submit>
              <button type="button" onClick={() => { setMode("signin"); setErr(""); setMsg(""); }}
                className="text-xs text-brand font-bold hover:underline block w-full text-center mt-2">
                ← Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ type, placeholder, value, onChange, autoComplete }: {
  type: string; placeholder: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
}) {
  return (
    <input type={type} placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
      className="w-full border-[1.5px] border-line rounded-[11px] px-4 py-3 text-base outline-none bg-surface-muted focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition"
    />
  );
}

function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={busy}
      className="w-full bg-brand hover:bg-brand-hover text-brand-fg rounded-[11px] py-3.5 font-extrabold text-base transition-colors disabled:opacity-60 mt-2">
      {busy ? "Please wait..." : children}
    </button>
  );
}

function Alert({ kind, children }: { kind: "err" | "ok"; children: React.ReactNode }) {
  const cls = kind === "err"
    ? "bg-danger-bg text-danger border-danger/25"
    : "bg-ok-bg text-ok border-ok/25";
  return (
    <div className={`text-xs font-semibold rounded-lg border px-3 py-2 ${cls}`}>{children}</div>
  );
}

function prettyError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes("auth/email-already-in-use")) return "An account with that email already exists";
  if (m.includes("auth/invalid-credential") || m.includes("auth/wrong-password") || m.includes("auth/user-not-found"))
    return "Invalid credentials";
  if (m.includes("auth/invalid-email")) return "Invalid email address";
  if (m.includes("auth/weak-password")) return "Password is too weak";
  if (m.includes("auth/too-many-requests")) return "Too many attempts. Try later.";
  if (m.includes("auth/network-request-failed")) return "Network error. Check your connection.";
  return m.replace(/^Firebase: /, "").slice(0, 120);
}
