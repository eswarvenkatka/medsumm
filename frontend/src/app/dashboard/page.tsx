"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getApiUrl } from "@/lib/utils";
import { 
  FileText, AlertTriangle, Eye, Loader2, Plus 
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

  if (authLoading || (loading && !token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const highRiskCount = documents.filter(doc => doc.summary?.risk_level?.toUpperCase().includes("HIGH")).length;
  const medRiskCount = documents.filter(doc => doc.summary?.risk_level?.toUpperCase().includes("MEDIUM")).length;
  const lowRiskCount = documents.filter(doc => doc.summary?.risk_level?.toUpperCase().includes("LOW")).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Medical Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Analyze, review, and query clinical document histories
            </p>
          </div>
          
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </Link>
        </div>

        {/* Stats Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Uploads</p>
            <h3 className="text-3xl font-bold mt-2 text-white">{documents.length}</h3>
          </div>
          
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
            <p className="text-red-400 text-xs font-semibold uppercase tracking-wider">High Risk Alerts</p>
            <h3 className="text-3xl font-bold mt-2 text-red-500">{highRiskCount}</h3>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Medium Risk Reports</p>
            <h3 className="text-3xl font-bold mt-2 text-yellow-500">{medRiskCount}</h3>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
            <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">Low Risk / Normal</p>
            <h3 className="text-3xl font-bold mt-2 text-green-500">{lowRiskCount}</h3>
          </div>
        </div>

        {/* Document list */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Uploaded Records</h2>
            <span className="text-xs text-slate-500">{documents.length} files total</span>
          </div>

          {documents.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="h-12 w-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-medium text-sm">No medical records uploaded yet</p>
              <p className="text-slate-500 text-xs mt-1">Upload a clinical report to generate a structured AI summary.</p>
              <Link
                href="/dashboard/upload"
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Upload File
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs font-semibold">
                    <th className="py-4 px-6">File Name</th>
                    <th className="py-4 px-6">Uploaded Date</th>
                    <th className="py-4 px-6">Patient info</th>
                    <th className="py-4 px-6">Risk Level</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {documents.map((doc) => {
                    const risk = doc.summary?.risk_level?.toUpperCase() || "LOW";
                    const isHigh = risk.includes("HIGH");
                    const isMed = risk.includes("MEDIUM");

                    return (
                      <tr key={doc.id} className="hover:bg-slate-900/30 transition-colors text-sm">
                        <td className="py-4 px-6 font-semibold text-slate-100 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-400" />
                          {doc.filename}
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-slate-400 truncate max-w-xs">
                          {doc.summary?.patient_info || "Not specified"}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              isHigh
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : isMed
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-green-500/10 text-green-400 border-green-500/20"
                            }`}
                          >
                            {(isHigh || isMed) && <AlertTriangle className="h-3 w-3" />}
                            {risk}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/dashboard/documents/detail?id=${doc.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Summary
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
