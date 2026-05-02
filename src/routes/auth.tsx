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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* Brand panel — Left side on desktop */}
      <div
        className="lg:w-[45%] min-h-[300px] lg:min-h-screen flex flex-col justify-center items-center text-white p-12 lg:p-24 relative"
        style={{ background: "var(--brand)" }}
      >
        <div className="max-w-md w-full relative z-10 text-center lg:text-left">
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-none mb-6">SKT<br/>Stores</h1>
          <p className="text-xl lg:text-2xl text-white/90 font-bold mb-12 uppercase tracking-[0.2em]">
            Premium Shopping
          </p>
          
          <div className="hidden lg:grid grid-cols-1 gap-8 text-white/90">
            <Feature icon="🛍️" title="Curated Collection" desc="Only the best products for your lifestyle." />
            <Feature icon="📦" title="Smart Tracking" desc="Real-time updates on every package." />
            <Feature icon="🚚" title="Fast Delivery" desc="Secure door-to-door delivery service." />
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-black/10 blur-[100px]"></div>
      </div>

      {/* Form panel — Right side on desktop */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-20 bg-[#f4f7f9]">
        <div
          className="bg-white rounded-[48px] p-8 lg:p-12 w-full max-w-[520px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-white"
        >
          {mode !== "forgot" && (
            <div className="flex bg-[#f4f7f9] rounded-[24px] p-2 mb-10">
              <TabBtn active={mode === "signin"} onClick={() => setMode("signin")} label="Sign In" />
              <TabBtn active={mode === "signup"} onClick={() => setMode("signup")} label="Sign Up" />
            </div>
          )}

          {mode === "signin" && (
            <form onSubmit={handleSignin} className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">Welcome back! 👋</h2>
                <p className="text-gray-400 font-bold">Sign in to start your shopping journey.</p>
              </div>

              <div className="flex gap-2 p-1.5 bg-[#f4f7f9] rounded-2xl">
                <MiniTab active={signinMode === "email"} onClick={() => setSigninMode("email")} label="Email" />
                <MiniTab active={signinMode === "username"} onClick={() => setSigninMode("username")} label="Username" />
              </div>

              <div className="space-y-4">
                <AuthInput
                  type={signinMode === "email" ? "email" : "text"}
                  placeholder={signinMode === "email" ? "Email Address" : "Username"}
                  value={si_id} onChange={setSiId}
                />
                <AuthInput type="password" placeholder="Password" value={si_pwd} onChange={setSiPwd} />
              </div>

              <button type="button" onClick={() => { setMode("forgot"); setErr(""); setMsg(""); }}
                className="text-xs text-brand font-black uppercase tracking-widest hover:underline">
                Forgot password?
              </button>

              {err && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">{err}</div>}
              
              <div className="space-y-4 pt-2">
                <SubmitBtn busy={busy}>Sign In</SubmitBtn>
                
                <div className="relative flex items-center justify-center py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                  <span className="relative bg-white px-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">OR</span>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogle} 
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-100 rounded-3xl py-5 font-black text-sm flex items-center justify-center gap-4 shadow-sm transition-all active:scale-95"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.71 1.7l3.48-3.48C17.91 1.25 15.21 0 12 0 7.31 0 3.25 2.67 1.25 6.57l4.08 3.17c.98-2.91 3.66-4.7 6.67-4.7z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.8-.07-1.56-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.89 3c2.28-2.1 3.53-5.2 3.53-8.82z"/>
                    <path fill="#FBBC05" d="M5.33 14.24c-.23-.69-.36-1.42-.36-2.24s.13-1.55.36-2.24L1.25 6.57C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.43l4.08-3.19z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3c-1.11.75-2.52 1.19-4.04 1.19-3.02 0-5.6-2.03-6.52-4.77l-4.14 3.19C3.39 21.36 7.39 24 12 24z"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5 animate-fade-up">
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">Create Account ✨</h2>
                <p className="text-gray-400 font-bold">Join the SKT premium community.</p>
              </div>
              <AuthInput type="text" placeholder="Full Name" value={su_name} onChange={setSuName} />
              <div className="grid grid-cols-2 gap-4">
                <AuthInput type="text" placeholder="Username" value={su_user} onChange={(v) => setSuUser(v.toLowerCase())} />
                <AuthInput type="tel" placeholder="Phone" value={su_phone} onChange={setSuPhone} />
              </div>
              <AuthInput type="email" placeholder="Email Address" value={su_email} onChange={setSuEmail} />
              <AuthInput type="password" placeholder="Password" value={su_pwd} onChange={setSuPwd} />
              <AuthInput type="password" placeholder="Confirm Password" value={su_pwd2} onChange={setSuPwd2} />
              {err && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">{err}</div>}
              <SubmitBtn busy={busy}>Create Account</SubmitBtn>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">Recover Access</h2>
                <p className="text-gray-400 font-bold">Enter your email to reset your password.</p>
              </div>
              <AuthInput type="email" placeholder="Email Address" value={fp_email} onChange={setFpEmail} />
              {err && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">{err}</div>}
              {msg && <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-bold border border-green-100">{msg}</div>}
              <SubmitBtn busy={busy}>Send Reset Link</SubmitBtn>
              <button type="button" onClick={() => { setMode("signin"); setErr(""); setMsg(""); }}
                className="text-xs text-brand font-black uppercase tracking-widest hover:underline block w-full text-center">
                ← Return to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-6 group">
      <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center text-3xl group-hover:bg-white/20 transition-all shadow-xl">{icon}</div>
      <div>
        <h4 className="text-lg font-black text-white">{title}</h4>
        <p className="text-sm text-white/60 font-bold">{desc}</p>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`flex-1 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${active ? 'bg-white text-brand shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{label}</button>
  );
}

function MiniTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${active ? 'bg-brand text-white shadow-md' : 'text-gray-400 hover:text-brand'}`}>{label}</button>
  );
}

function AuthInput({ type, placeholder, value, onChange }: { type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} 
      className="w-full bg-[#f4f7f9] border border-[#e4e9ed] rounded-[22px] px-6 py-5 font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-brand/10 focus:border-brand/50 transition-all placeholder:text-gray-300" 
    />
  );
}

function SubmitBtn({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={busy} className="w-full bg-brand hover:bg-brand-hover text-white rounded-[22px] py-5 font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand/30 transition-all active:scale-95 disabled:opacity-50">
      {busy ? "Processing..." : children}
    </button>
  );
}

function prettyError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes("already registered")) return "Email already registered.";
  if (m.includes("Invalid login credentials")) return "Invalid email or password.";
  return m.slice(0, 80);
}
