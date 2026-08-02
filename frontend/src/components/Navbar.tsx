"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, UploadCloud, LayoutDashboard, Settings } from "lucide-react";
import SriHospitalLogo from "@/components/ui/SriHospitalLogo";

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

  const isAdmin = user?.email === "esw28351@gmail.com";

  return (
    <div className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8">
      <header className="max-w-7xl mx-auto rounded-2xl border border-[rgba(10,78,122,0.15)] bg-white/95 backdrop-blur-md shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group transition-all">
              <SriHospitalLogo size={36} showTagline={false} />
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
                        ? "text-indigo-500 bg-indigo-500/10 shadow-sm font-bold"
                        : "text-slate-500 hover:text-indigo-500 hover:bg-slate-150"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
              
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                    pathname === "/admin"
                      ? "text-indigo-500 bg-indigo-500/10 shadow-sm font-bold"
                      : "text-slate-500 hover:text-indigo-500 hover:bg-slate-150"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                  {pathname === "/admin" && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-[#1e293b]">
                {user?.displayName || user?.email?.split("@")[0] || "Medical Specialist"}
              </p>
              <p className="text-[10px] text-[#475569] font-mono tracking-wider uppercase mt-0.5">
                {role || "Physician"}
              </p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200 hover:border-red-300 text-[#475569] hover:text-red-650 hover:bg-red-50 transition-all text-xs font-semibold cursor-pointer"
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
