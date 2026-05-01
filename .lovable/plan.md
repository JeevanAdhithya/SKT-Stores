# SKT Stores — Real Accounts, Profiles & Responsive Layout

Turn the storefront into a real e-commerce app: proper sign up / sign in, a profile section users can edit, delivery addresses on every order, and a desktop layout (not just a 430px mobile shell).

## 1. Authentication (Firebase Auth)

Use **Firebase Authentication** alongside the existing Realtime Database (same project — no new backend).

**Signup fields (all required):**
- Full name
- Username (unique, 3–20 chars, lowercase letters/numbers/underscore)
- Email
- Phone (required, since orders need it)
- Password (min 8 chars)

**Login (one form, two modes):**
- Toggle: "Email" / "Username"
- Field 1: email *or* username
- Field 2: password
- Username login works by looking up `usernames/{username}` → email, then signing in with email+password.

**Auth screens** replace the current `Splash`:
- `/auth` route with Sign In (default) and Sign Up tabs
- "Forgot password?" link → sends reset email via `sendPasswordResetEmail`
- After auth, redirect to `/`

**Data model in Realtime DB:**
```
users/{uid} = { name, username, email, phone, address, city, pincode, createdAt }
usernames/{username} = uid          // uniqueness index
orders/{orderId} = { ...existing fields, userId, deliveryAddress }
```

Username uniqueness is enforced via a transaction on `usernames/{username}` at signup.

## 2. Profile Section (replaces "Store connected" item)

- **Bottom nav** changes from `[Menu, Cart, Orders]` to `[Menu, Cart, Orders, Profile]`.
- The "Store connected" sync bar on the shop page is **removed** entirely (it's noise for end users).
- The small connection dot stays in the header but only shows on error.

**Profile page contents:**
- Avatar circle + name + username + email
- **Edit Profile** form: name, phone, default delivery address, city, pincode (email & username read-only)
- **Change Password** (re-auth with current password, then update)
- **Log Out** button (red, bottom)
- Order count + total spent (computed from their orders)

## 3. Delivery Address on Orders

Cart page gets a new **Delivery Details** card (replaces the freeform "Table No / Note"):
- Address line (required, prefilled from profile)
- City (required, prefilled)
- Pincode (6 digits, required, prefilled)
- Landmark (optional)
- Order notes (optional)
- "Save as default address" checkbox (writes back to profile)

Order placement is blocked until address fields are valid. The `Order` type gains a `deliveryAddress` object and `userId`.

## 4. Responsive Desktop Layout

The current app is locked to `max-w-[430px]`. Make it adapt:

**Breakpoints:**
- `< 768px` (mobile): current single-column layout, bottom nav.
- `≥ 768px` (tablet/desktop):
  - Remove the 430px cap on the main shell.
  - **Top navigation bar** replaces the bottom nav: logo left, links (Menu / Orders / Profile) center, cart button + user chip right.
  - **Shop page**: 3-column product grid at `md`, 4-column at `lg`, max content width `1200px`, centered.
  - **Cart page**: 2-column layout — items list on the left (8 cols), sticky bill summary + delivery details on the right (4 cols).
  - **Orders page**: 2-column card grid at `lg`.
  - **Profile page**: centered card, max-width `640px`.
  - **Auth page**: centered card with a brand-gradient background panel on the left (split-screen at `md+`).

Bottom nav is hidden at `md+`; top nav is hidden below `md`.

## 5. File Changes

**New:**
- `src/lib/auth.ts` — wraps Firebase Auth (signUp, signInWithEmail, signInWithUsername, signOut, resetPassword, updateProfile, changePassword, username availability check).
- `src/hooks/useAuth.ts` — exposes `{ user, profile, loading, ...actions }` via `onAuthStateChanged` + `users/{uid}` listener.
- `src/components/auth/AuthPage.tsx` — sign in / sign up tabs.
- `src/components/auth/SignInForm.tsx`, `SignUpForm.tsx`, `ForgotPasswordForm.tsx`.
- `src/components/ProfilePage.tsx` — view + edit + logout + change password.
- `src/components/TopNav.tsx` — desktop header nav.
- `src/routes/auth.tsx` — public `/auth` route.

**Edited:**
- `src/lib/firebase.ts` — add `getAuth()` singleton.
- `src/lib/types.ts` — `UserProfile`, `DeliveryAddress`; extend `Order` with `userId` & `deliveryAddress`.
- `src/lib/orders.ts` — write `userId` + `deliveryAddress`; query my orders by `userId` instead of name.
- `src/hooks/useMyOrders.ts` — query by `userId`.
- `src/hooks/useCustomer.ts` — replaced by `useAuth`; remove file or keep as thin shim.
- `src/components/BottomNav.tsx` — add Profile tab; hide at `md+`.
- `src/components/Header.tsx` — remove "Store connected" pill; on desktop render `TopNav` instead.
- `src/components/ShopPage.tsx` — remove sync bar; responsive grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- `src/components/CartPage.tsx` — delivery address card; 2-column layout at `md+`.
- `src/components/OrdersPage.tsx` — 2-column at `lg`.
- `src/components/Splash.tsx` — deleted (replaced by `/auth`).
- `src/routes/index.tsx` — guard with `useAuth`; redirect to `/auth` when signed out; add Profile tab; pass `userId` & default address into cart.
- `src/routes/__root.tsx` — wrap with auth provider context.

## 6. Firebase Realtime DB Rules (for the user to paste in console)

The plan assumes these rules so users can only read/write their own profile and orders:

```json
{
  "rules": {
    "users":     { "$uid":  { ".read": "auth != null && auth.uid == $uid", ".write": "auth != null && auth.uid == $uid" } },
    "usernames": { ".read": "auth != null", "$u": { ".write": "auth != null && (!data.exists() || data.val() == auth.uid)" } },
    "products":  { ".read": true, ".write": false },
    "orders":    { ".read": "auth != null", "$oid": { ".write": "auth != null && (!data.exists() || data.child('userId').val() == auth.uid)" } }
  }
}
```

I'll show this snippet again after implementation so you can paste it into the Firebase console (Realtime Database → Rules). Until then, the app will still work with your current open rules.

## 7. Out of Scope (for this iteration)

- Admin panel (next iteration).
- Email verification gating (we'll send the verification email but won't block login on it).
- Social login (Google/Apple) — easy to add later.
- Multiple saved addresses — one default address for now.

## What you'll see after this ships

1. Visit the site → land on `/auth` with Sign In / Sign Up tabs.
2. Create an account → land on the shop, top-right shows your name.
3. Add to cart → cart asks for delivery address (prefilled from profile).
4. Place order → saved against your account, visible in Orders forever.
5. Profile tab → edit details, change password, log out.
6. Open on a laptop → full-width layout with top nav, multi-column grid.