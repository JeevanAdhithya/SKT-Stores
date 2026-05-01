import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signUp, signInWithEmail, signInWithUsername, resetPassword, validateUsername, signInWithGoogle } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
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

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e2) {
      setErr(prettyError(e2));
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
      {/* Brand panel — Left side on desktop */}
      <div
        className="md:w-1/2 md:min-h-dvh flex flex-col justify-center items-center text-white p-8 md:p-12 relative overflow-hidden"
        style={{ background: "var(--brand)" }}
      >
        <div className="max-w-sm text-center md:text-left relative z-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-2">SKT Stores</h1>
          <p className="text-lg md:text-xl text-white/90 font-medium mb-8">
            Fresh food · Fast ordering
          </p>
          <ul className="hidden md:block space-y-4 text-white/90 text-base font-semibold">
            <li className="flex items-center gap-3">
              <span className="bg-white/20 p-2 rounded-lg">🍽️</span> 
              Browse a curated menu
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-white/20 p-2 rounded-lg">📦</span> 
              Track every order live
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-white/20 p-2 rounded-lg">🚚</span> 
              Doorstep delivery
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-white/20 p-2 rounded-lg">👤</span> 
              Save your details for next time
            </li>
          </ul>
        </div>
        
        {/* Subtle background decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[80px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-white/5 blur-[60px]"></div>
      </div>

      {/* Form panel — Right side on desktop */}
      <div className="flex-1 flex items-center justify-center p-5 md:p-10 bg-surface-muted dark:bg-[#0a0a0a]">
        <div
          className="bg-surface dark:bg-zinc-900 rounded-[32px] p-6 md:p-10 w-full max-w-[460px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-line/50 dark:border-white/5"
        >
          {mode !== "forgot" && (
            <div className="flex bg-surface-muted dark:bg-white/5 rounded-[18px] p-1.5 mb-8">
              <button
                onClick={() => { setMode("signin"); setErr(""); setMsg(""); }}
                className={`flex-1 py-3 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  mode === "signin" ? "bg-surface dark:bg-white/10 text-brand shadow-sm" : "text-muted-text hover:text-foreground"
                }`}
              >Sign In</button>
              <button
                onClick={() => { setMode("signup"); setErr(""); setMsg(""); }}
                className={`flex-1 py-3 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  mode === "signup" ? "bg-surface dark:bg-white/10 text-brand shadow-sm" : "text-muted-text hover:text-foreground"
                }`}
              >Sign Up</button>
            </div>
          )}

          {mode === "signin" && (
            <form onSubmit={handleSignin} className="space-y-5 animate-fade-up">
              <div className="mb-2">
                <h2 className="text-3xl font-black tracking-tight mb-1">Welcome back 👋</h2>
                <p className="text-sm text-muted-text font-medium">Sign in to continue ordering</p>
              </div>

              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setSigninMode("email")}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    signinMode === "email" ? "bg-brand text-white border-brand shadow-md" : "bg-transparent border-line text-muted-text hover:border-brand/30"
                  }`}>Email</button>
                <button type="button" onClick={() => setSigninMode("username")}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    signinMode === "username" ? "bg-brand text-white border-brand shadow-md" : "bg-transparent border-line text-muted-text hover:border-brand/30"
                  }`}>Username</button>
              </div>

              <div className="space-y-4">
                <Input
                  type={signinMode === "email" ? "email" : "text"}
                  placeholder={signinMode === "email" ? "Email address" : "Username"}
                  value={si_id} onChange={(v) => setSiId(v)}
                  autoComplete={signinMode === "email" ? "email" : "username"}
                />
                <Input type="password" placeholder="Password" value={si_pwd}
                  onChange={(v) => setSiPwd(v)} autoComplete="current-password" />
              </div>

              <button type="button" onClick={() => { setMode("forgot"); setErr(""); setMsg(""); }}
                className="text-[11px] text-brand font-black uppercase tracking-wider hover:underline block">
                Forgot password?
              </button>

              {err && <Alert kind="err">{err}</Alert>}
              
              <div className="space-y-4 pt-2">
                <Submit busy={busy}>Sign In</Submit>
                
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line/50"></div></div>
                  <span className="relative bg-surface dark:bg-zinc-900 px-4 text-[10px] font-black text-muted-text uppercase tracking-widest">OR</span>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogle} 
                  disabled={busy}
                  className="w-full bg-surface hover:bg-surface-muted dark:bg-white/5 dark:hover:bg-white/10 text-foreground border border-line rounded-2xl py-3.5 font-black text-sm transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.71 1.7l3.48-3.48C17.91 1.25 15.21 0 12 0 7.31 0 3.25 2.67 1.25 6.57l4.08 3.17c.98-2.91 3.66-4.7 6.67-4.7z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.8-.07-1.56-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.89 3c2.28-2.1 3.53-5.2 3.53-8.82z"/>
                    <path fill="#FBBC05" d="M5.33 14.24c-.23-.69-.36-1.42-.36-2.24s.13-1.55.36-2.24L1.25 6.57C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.43l4.08-3.19z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3c-1.11.75-2.52 1.19-4.04 1.19-3.02 0-5.6-2.03-6.52-4.77l-4.14 3.19C3.39 21.36 7.39 24 12 24z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fade-up">
              <div className="mb-4">
                <h2 className="text-3xl font-black tracking-tight mb-1">Create account ✨</h2>
                <p className="text-sm text-muted-text font-medium">Join SKT Stores today</p>
              </div>
              <Input type="text" placeholder="Full name" value={su_name} onChange={setSuName} autoComplete="name" />
              <div className="grid grid-cols-2 gap-3">
                <Input type="text" placeholder="Username" value={su_user}
                  onChange={(v) => setSuUser(v.toLowerCase())} autoComplete="username" />
                <Input type="tel" placeholder="Phone" value={su_phone} onChange={setSuPhone} autoComplete="tel" />
              </div>
              <Input type="email" placeholder="Email" value={su_email} onChange={setSuEmail} autoComplete="email" />
              <Input type="password" placeholder="Password (min 8 chars)" value={su_pwd}
                onChange={setSuPwd} autoComplete="new-password" />
              <Input type="password" placeholder="Confirm password" value={su_pwd2}
                onChange={setSuPwd2} autoComplete="new-password" />
              {err && <Alert kind="err">{err}</Alert>}
              <Submit busy={busy}>Create Account</Submit>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-5 animate-fade-up">
              <div className="mb-4">
                <h2 className="text-3xl font-black tracking-tight mb-1">Reset password</h2>
                <p className="text-sm text-muted-text font-medium">Enter your email for a reset link</p>
              </div>
              <Input type="email" placeholder="Email address" value={fp_email}
                onChange={setFpEmail} autoComplete="email" />
              {err && <Alert kind="err">{err}</Alert>}
              {msg && <Alert kind="ok">{msg}</Alert>}
              <Submit busy={busy}>Send reset link</Submit>
              <button type="button" onClick={() => { setMode("signin"); setErr(""); setMsg(""); }}
                className="text-[11px] text-brand font-black uppercase tracking-wider hover:underline block w-full text-center mt-4">
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
      className="w-full border border-line rounded-2xl px-5 py-4 text-sm outline-none bg-surface-muted focus:bg-surface focus:border-brand/50 focus:ring-4 focus:ring-brand/10 transition-all font-medium"
    />
  );
}

function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={busy}
      className="w-full bg-brand hover:bg-brand-hover text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest transition-all shadow-[0_10px_25px_-10px_rgba(232,69,10,0.4)] active:scale-[0.98] disabled:opacity-50 mt-2">
      {busy ? "Please wait..." : children}
    </button>
  );
}

function Alert({ kind, children }: { kind: "err" | "ok"; children: React.ReactNode }) {
  const cls = kind === "err"
    ? "bg-danger-bg text-danger border-danger/20"
    : "bg-ok-bg text-ok border-ok/20";
  return (
    <div className={`text-[11px] font-bold rounded-xl border px-4 py-3 ${cls} animate-fade-up`}>{children}</div>
  );
}

function prettyError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes("already registered") || m.includes("already exists")) return "An account with that email already exists";
  if (m.includes("Invalid login credentials") || m.includes("invalid-credential"))
    return "Invalid credentials";
  if (m.includes("Email not confirmed")) return "Please confirm your email address";
  if (m.includes("rate limit")) return "Too many attempts. Try later.";
  return m.slice(0, 120);
}
