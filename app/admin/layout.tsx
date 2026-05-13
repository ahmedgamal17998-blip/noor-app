"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkIsAdmin, clearAdminCache } from "@/lib/auth/admin";
import { signOut } from "@/lib/supabase";
import type { Admin } from "@/lib/db/types";

const NAV = [
  { href: "/admin", label: "الرئيسية", icon: "🏠" },
  { href: "/admin/surahs", label: "السور", icon: "📖" },
  { href: "/admin/journey-builder", label: "بناء الرحلة", icon: "🗺️" },
  { href: "/admin/users", label: "المستخدمين", icon: "👥" },
  { href: "/admin/community", label: "المجتمع", icon: "💬" },
  { href: "/admin/avatar-shop", label: "المتجر", icon: "🎨" },
  { href: "/admin/analytics", label: "الإحصائيات", icon: "📊" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }
    void checkIsAdmin().then((a) => {
      if (!a) {
        router.replace("/admin/login");
        return;
      }
      setAdmin(a);
      setLoading(false);
    });
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sand">
        <div className="text-masjid font-bold animate-pulse">جاري التحقق...</div>
      </main>
    );
  }

  if (!admin) return null;

  const doSignOut = async () => {
    await signOut();
    clearAdminCache();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-sand-dark/30 flex">
      <aside className="w-64 bg-masjid-dark text-sand p-5 flex-col gap-2 sticky top-0 h-screen hidden md:flex">
        <div className="mb-6">
          <p className="text-2xl font-bold">🌙 نور Admin</p>
          <p className="text-xs opacity-70 mt-1">{admin.email}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  active ? "bg-masjid text-sand" : "hover:bg-masjid/40"
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={doSignOut}
          className="text-xs text-sand/70 hover:text-sand py-2"
        >
          تسجيل خروج
        </button>
      </aside>

      {/* mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 bg-masjid-dark text-sand p-3 z-40">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold">🌙 نور Admin</p>
          <button onClick={doSignOut} className="text-xs opacity-70">
            خروج
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs whitespace-nowrap ${
                  active ? "bg-masjid text-sand" : "bg-masjid/40"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 p-5 md:p-8 pt-32 md:pt-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
