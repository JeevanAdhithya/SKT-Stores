import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminPage } from "@/components/AdminPage";
import { useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { useCart } from "@/hooks/useCart";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

const ADMIN_EMAIL = 'sktstores37@gmail.com';

function AdminRoute() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { totalQty } = useCart();

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="p-10 text-center">Checking credentials...</div>;
  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-dvh bg-background">
      <TopNav active="profile" cartCount={totalQty} name={profile?.name || 'Admin'} email={user.email} onChange={(t) => navigate({to: '/'})} />
      <main className="md:px-6 md:py-2">
        <AdminPage />
      </main>
    </div>
  );
}
