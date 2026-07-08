"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Activity, LogOut, UploadCloud, LayoutDashboard, Settings } from "lucide-react";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/upload", label: "Upload Document", icon: UploadCloud },
  ];

  const isAdmin = role === "admin" || user?.email === "eswar@medsumm.ai";

  return (
    <div className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8">
      <header className="max-w-7xl mx-auto rounded-2xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-xl shadow-slate-950/50">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group transition-all">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <Activity className="h-5 w-5 text-white animate-pulse" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                MedSumm AI
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                      isActive
                        ? "text-indigo-400 bg-slate-900/60 shadow-inner"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/30"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
              
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                    pathname === "/admin"
                      ? "text-indigo-400 bg-slate-900/60 shadow-inner"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/30"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                  {pathname === "/admin" && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" />
                  )}
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-200">
                {user?.displayName || user?.email?.split("@")[0] || "Medical Specialist"}
              </p>
              <p className="text-[10px] text-indigo-400/80 font-mono tracking-wider uppercase mt-0.5">
                {role || "Physician"}
              </p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-xs font-semibold"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
