import { useState } from "react";
import { signOut, updateProfile, changePassword } from "@/lib/auth";
import { showToast } from "./Toast";
import type { UserProfile, Order } from "@/lib/types";
import type { User } from "firebase/auth";

type Props = {
  user: User;
  profile: UserProfile;
  orders: Order[];
};

export function ProfilePage({ user, profile, orders }: Props) {
  const [editing, setEditing] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address || "");
  const [city, setCity] = useState(profile.city || "");
  const [pincode, setPincode] = useState(profile.pincode || "");
  const [saving, setSaving] = useState(false);

  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);

  const totalSpent = orders
    .filter((o) => o.status !== "rejected")
    .reduce((s, o) => s + o.total, 0);

  const save = async () => {
    if (!name.trim()) return showToast("Name required", "red");
    setSaving(true);
    try {
      await updateProfile(profile.uid, {
        name: name.trim(), phone: phone.trim(),
        address: address.trim(), city: city.trim(), pincode: pincode.trim(),
      });
      showToast("Profile updated!", "green");
      setEditing(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed", "red");
    } finally {
      setSaving(false);
    }
  };

  const submitPwd = async () => {
    if (newPwd.length < 8) return showToast("Password min 8 chars", "red");
    if (newPwd !== newPwd2) return showToast("Passwords don't match", "red");
    setPwdBusy(true);
    try {
      await changePassword(user, curPwd, newPwd);
      showToast("Password updated!", "green");
      setChangingPwd(false);
      setCurPwd(""); setNewPwd(""); setNewPwd2("");
    } catch (e) {
      const m = e instanceof Error ? e.message : "Failed";
      showToast(m.includes("invalid-credential") || m.includes("wrong-password") ? "Current password is wrong" : m, "red");
    } finally {
      setPwdBusy(false);
    }
  };

  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <div className="animate-fade-up pb-[100px] md:pb-10 px-3.5 md:px-0 pt-3.5 max-w-[640px] mx-auto w-full">
      <div className="bg-surface rounded-[16px] border-[1.5px] border-line p-5 md:p-6 mb-3">
        <div className="flex items-center gap-4">
          <div
            className="w-[64px] h-[64px] rounded-full flex items-center justify-center text-2xl font-black text-brand-fg flex-shrink-0"
            style={{ background: "var(--gradient-brand)" }}
          >{initial}</div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-extrabold truncate">{profile.name}</div>
            <div className="text-xs text-muted-text truncate">@{profile.username}</div>
            <div className="text-xs text-muted-text truncate">{profile.email}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-line">
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Total spent" value={`₹${totalSpent}`} />
        </div>
      </div>

      <div className="bg-surface rounded-[16px] border-[1.5px] border-line p-5 mb-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[15px] font-extrabold">👤 My Details</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="text-xs font-bold text-brand">Edit</button>
          ) : (
            <button onClick={() => {
              setEditing(false);
              setName(profile.name); setPhone(profile.phone);
              setAddress(profile.address||""); setCity(profile.city||"");
              setPincode(profile.pincode||"");
            }} className="text-xs font-bold text-muted-text">Cancel</button>
          )}
        </div>

        <Field label="Full name">
          <input type="text" value={name} disabled={!editing}
            onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Username">
          <input type="text" value={profile.username} readOnly />
        </Field>
        <Field label="Email">
          <input type="email" value={profile.email} readOnly />
        </Field>
        <Field label="Phone">
          <input type="tel" value={phone} disabled={!editing}
            onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Default address">
          <input type="text" value={address} disabled={!editing}
            placeholder="House/flat, street, area"
            onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="City">
            <input type="text" value={city} disabled={!editing}
              onChange={(e) => setCity(e.target.value)} />
          </Field>
          <Field label="Pincode">
            <input type="text" value={pincode} disabled={!editing} maxLength={6}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>

        {editing && (
          <button onClick={save} disabled={saving}
            className="w-full bg-brand hover:bg-brand-hover text-brand-fg rounded-[11px] py-3 font-extrabold text-sm disabled:opacity-60 mt-2">
            {saving ? "Saving..." : "Save changes"}
          </button>
        )}
      </div>

      <div className="bg-surface rounded-[16px] border-[1.5px] border-line p-5 mb-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[15px] font-extrabold">🔒 Security</h3>
          {!changingPwd ? (
            <button onClick={() => setChangingPwd(true)}
              className="text-xs font-bold text-brand">Change password</button>
          ) : (
            <button onClick={() => { setChangingPwd(false); setCurPwd(""); setNewPwd(""); setNewPwd2(""); }}
              className="text-xs font-bold text-muted-text">Cancel</button>
          )}
        </div>
        {changingPwd && (
          <>
            <Field label="Current password">
              <input type="password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} />
            </Field>
            <Field label="New password (min 8)">
              <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            </Field>
            <Field label="Confirm new password">
              <input type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} />
            </Field>
            <button onClick={submitPwd} disabled={pwdBusy}
              className="w-full bg-brand hover:bg-brand-hover text-brand-fg rounded-[11px] py-3 font-extrabold text-sm disabled:opacity-60 mt-2">
              {pwdBusy ? "Updating..." : "Update password"}
            </button>
          </>
        )}
      </div>

      <button
        onClick={async () => { await signOut(); }}
        className="w-full bg-danger-bg text-danger border-[1.5px] border-danger/25 rounded-[13px] py-3.5 font-extrabold text-sm hover:bg-danger hover:text-white transition mt-2">
        Log out
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-black text-brand">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-text font-bold">{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 [&_input]:w-full [&_input]:bg-surface-muted [&_input]:border-[1.5px] [&_input]:border-line [&_input]:rounded-[10px] [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:outline-none [&_input]:transition [&_input:focus]:border-brand [&_input[readonly]]:bg-line [&_input[readonly]]:text-muted-text [&_input:disabled]:bg-line [&_input:disabled]:text-muted-text">
      <label className="text-[11px] font-bold text-muted-text block mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
