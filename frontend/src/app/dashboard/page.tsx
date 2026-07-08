"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getApiUrl } from "@/lib/utils";
import { 
  FileText, AlertTriangle, Eye, Loader2, Plus, Search, Filter, HelpCircle, ShieldAlert, CheckCircle2 
} from "lucide-react";

interface DocumentMeta {
  id: string;
  filename: string;
  uploaded_at: string;
  summary: {
    risk_level?: string;
    patient_info?: string;
  };
}

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${getApiUrl()}/api/documents`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        }
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDocs();
    }
  }, [token]);

  if (authLoading || (loading && token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const highRiskCount = documents.filter(doc => doc.summary?.risk_level?.toUpperCase().includes("HIGH")).length;
  const medRiskCount = documents.filter(doc => doc.summary?.risk_level?.toUpperCase().includes("MEDIUM")).length;
  const lowRiskCount = documents.filter(doc => {
    const risk = doc.summary?.risk_level?.toUpperCase() || "LOW";
    return risk.includes("LOW") || risk.includes("NORMAL");
  }).length;

  // Filter documents based on search & risk filter dropdown
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.summary?.patient_info || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const risk = doc.summary?.risk_level?.toUpperCase() || "LOW";
    const matchesRisk = riskFilter === "ALL" || 
                        (riskFilter === "HIGH" && risk.includes("HIGH")) ||
                        (riskFilter === "MEDIUM" && risk.includes("MEDIUM")) ||
                        (riskFilter === "LOW" && (risk.includes("LOW") || risk.includes("NORMAL")));
                        
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden grid-mesh">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] animate-float -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[100px] animate-float -z-10" />

      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10 relative">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              Clinical Workspace
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Monitor, search, and analyze patient summaries with semantic RAG pipelines.
            </p>
          </div>
          
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-650 to-indigo-550 hover:opacity-90 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            Upload Report
          </Link>
        </div>

        {/* Stats Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl glass-card transition-all duration-300 border-slate-800/80 hover:border-slate-700/85">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Clinical Files</p>
            <div className="flex items-baseline gap-2 mt-3">
              <h3 className="text-3.5xl font-black text-white">{documents.length}</h3>
              <span className="text-[10px] text-slate-400 font-medium">total uploads</span>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="p-5 rounded-2xl glass-card transition-all duration-300 border-slate-800/80 hover:border-red-500/30 group">
            <div className="flex justify-between items-start">
              <p className="text-red-400/90 text-xs font-bold uppercase tracking-wider">Critical Alerts</p>
              <ShieldAlert className="h-4 w-4 text-red-500/60" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <h3 className="text-3.5xl font-black text-red-500 group-hover:scale-105 transition-transform">{highRiskCount}</h3>
              <span className="text-[10px] text-red-450/80 font-medium">requires review</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl glass-card transition-all duration-300 border-slate-800/80 hover:border-yellow-500/30 group">
            <div className="flex justify-between items-start">
              <p className="text-yellow-400/90 text-xs font-bold uppercase tracking-wider">Elevated Risk</p>
              <AlertTriangle className="h-4 w-4 text-yellow-500/60" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <h3 className="text-3.5xl font-black text-yellow-500 group-hover:scale-105 transition-transform">{medRiskCount}</h3>
              <span className="text-[10px] text-yellow-450/85 font-medium">moderate status</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl glass-card transition-all duration-300 border-slate-800/80 hover:border-emerald-500/30 group">
            <div className="flex justify-between items-start">
              <p className="text-emerald-400/90 text-xs font-bold uppercase tracking-wider">Stable Reports</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-550/60" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <h3 className="text-3.5xl font-black text-emerald-500 group-hover:scale-105 transition-transform">{lowRiskCount}</h3>
              <span className="text-[10px] text-emerald-450/80 font-medium">normal parameters</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search reports by filename or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 border border-slate-800 bg-slate-900/20 backdrop-blur-sm rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
            <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-800 rounded-xl px-3.5 py-2">
              <Filter className="h-4 w-4 text-indigo-400" />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-950 text-slate-200">All Risk Profiles</option>
                <option value="HIGH" className="bg-slate-950 text-slate-200">Critical / High</option>
                <option value="MEDIUM" className="bg-slate-950 text-slate-200">Moderate / Med</option>
                <option value="LOW" className="bg-slate-950 text-slate-200">Stable / Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document list */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" /> Patient Intake Register
            </h2>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{filteredDocs.length} of {documents.length} files</span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="py-24 text-center">
              <FileText className="h-14 w-14 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-sm">No clinical files detected</p>
              <p className="text-slate-550 text-xs mt-1 max-w-sm mx-auto">Upload a medical scan (PDF/DOCX) to parse parameters and establish a RAG container.</p>
              <Link
                href="/dashboard/upload"
                className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all bg-slate-950/40"
              >
                Upload File
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-550 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4.5 px-6">File Name</th>
                    <th className="py-4.5 px-6">Intake Date</th>
                    <th className="py-4.5 px-6">Patient Identifier</th>
                    <th className="py-4.5 px-6">Risk Profile</th>
                    <th className="py-4.5 px-6 text-right">Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {filteredDocs.map((doc) => {
                    const risk = doc.summary?.risk_level?.toUpperCase() || "LOW";
                    const isHigh = risk.includes("HIGH");
                    const isMed = risk.includes("MEDIUM");

                    return (
                      <tr key={doc.id} className="hover:bg-slate-900/20 transition-all duration-200 text-sm">
                        <td className="py-4.5 px-6 font-bold text-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8.5 w-8.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center shrink-0">
                              <FileText className="h-4.5 w-4.5 text-indigo-400" />
                            </div>
                            <span className="truncate max-w-[200px] sm:max-w-xs">{doc.filename}</span>
                          </div>
                        </td>
                        <td className="py-4.5 px-6 text-slate-400 font-medium">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="py-4.5 px-6 text-slate-400 truncate max-w-xs font-medium">
                          {doc.summary?.patient_info || "Not specified"}
                        </td>
                        <td className="py-4.5 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                              isHigh
                                ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-sm shadow-red-500/5"
                                : isMed
                                ? "bg-yellow-500/10 text-yellow-450 border-yellow-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {isHigh ? (
                              <ShieldAlert className="h-3 w-3" />
                            ) : isMed ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {risk}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <Link
                            href={`/dashboard/documents/detail?id=${doc.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md"
                          >
                            <Eye className="h-3.5 w-3.5 text-indigo-400" />
                            Summarize
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
