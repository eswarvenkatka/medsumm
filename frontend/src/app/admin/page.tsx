"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { 
  ShieldAlert, Users, FileText, Database, 
  Loader2, AlertTriangle, Eye
} from "lucide-react";

interface AdminStats {
  total_users: number;
  total_documents: number;
  total_chunks_indexed: number;
  risk_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  recent_uploads: {
    id: string;
    filename: string;
    uploaded_at: string;
    user_id: string;
    risk_level: string;
  }[];
}

export default function AdminPage() {
  const { user, token, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const isAdmin = role === "admin" || user?.email === "eswar@medsumm.ai";

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        const timer = setTimeout(() => {
          if (!isAdmin) {
            router.push("/dashboard");
          } else {
            setAuthorized(true);
          }
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setAuthorized(true);
      }
    }
  }, [user, authLoading, role, isAdmin, router]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!token || !authorized) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token && authorized) {
      fetchAdminStats();
    }
  }, [token, authorized]);

  if (authLoading || (loading && authorized)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-center p-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 text-sm mt-1 max-w-sm">
          You do not have administrative privileges to view this page. Redirecting...
        </p>
      </div>
    );
  }

  if (!stats) return null;

  const totalRisks = (stats.risk_distribution.high + stats.risk_distribution.medium + stats.risk_distribution.low) || 1;
  const highPercent = Math.round((stats.risk_distribution.high / totalRisks) * 100);
  const medPercent = Math.round((stats.risk_distribution.medium / totalRisks) * 100);
  const lowPercent = Math.round((stats.risk_distribution.low / totalRisks) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-indigo-500" />
            Admin Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global system statistics, user database insights, and clinical risk ratios
          </p>
        </div>

        {/* Global stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{stats.total_users}</h3>
            </div>
            <Users className="h-10 w-10 text-indigo-500/20" />
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Reports</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{stats.total_documents}</h3>
            </div>
            <FileText className="h-10 w-10 text-cyan-500/20" />
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Indexed Chunks</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{stats.total_chunks_indexed}</h3>
            </div>
            <Database className="h-10 w-10 text-emerald-500/20" />
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Risk Level Ratio</p>
              <h3 className="text-3xl font-bold mt-2 text-red-500">
                {highPercent}% <span className="text-slate-400 text-sm font-normal">High</span>
              </h3>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500/20" />
          </div>
        </div>

        {/* Charts & Table grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-1 p-6 rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm">
            <h3 className="text-base font-bold text-white mb-6">Risk Level Ratio</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-red-400">High Risk ({stats.risk_distribution.high})</span>
                  <span>{highPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-red-500 h-full" style={{ width: `${highPercent}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-yellow-400">Medium Risk ({stats.risk_distribution.medium})</span>
                  <span>{medPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-yellow-500 h-full" style={{ width: `${medPercent}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-green-400">Low Risk ({stats.risk_distribution.low})</span>
                  <span>{lowPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-green-500 h-full" style={{ width: `${lowPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm">
            <h3 className="text-base font-bold text-white mb-4">Recent Global Uploads</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {stats.recent_uploads.map((doc) => {
                    const riskStr = doc.risk_level?.toUpperCase() || "LOW";
                    const isHigh = riskStr.includes("HIGH");
                    const isMed = riskStr.includes("MEDIUM");
                    
                    return (
                      <tr key={doc.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{doc.filename}</td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 truncate max-w-[100px]">{doc.user_id}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold border ${
                            isHigh
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : isMed
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20"
                          }`}>
                            {riskStr}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => router.push(`/dashboard/documents/detail?id=${doc.id}`)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
