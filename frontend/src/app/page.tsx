"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Activity, Brain, FileText, Cpu, ArrowRight, Shield } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-500 animate-pulse" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              MedSumm AI
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Background mesh gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
              <Brain className="h-3 w-3" /> Powered by Gemini & Qdrant Cloud
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Clinical Intelligence for{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Complex Medical Reports
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Instantly parse PDF and DOCX clinical summaries. Use advanced RAG capabilities to query medical files, identify risk indicators, and demystify terminology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 group"
              >
                Upload Your First File
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-850 font-semibold text-slate-300 border border-slate-800 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Core Capabilities</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Built with robust enterprise technologies to deliver instant, secure medical summaries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Automated Extraction</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Support for medical PDF & Word documents. Clean text extraction splits records into indexed vectors.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Clinical Summarization</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Powered by Gemini 2.5 Flash. Delivers structured data covering diagnostic reports, assessments, and warnings.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">RAG Contextual Chat</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Retrieve document chunks matching your question using text-embedding-004 vectors indexed inside Qdrant Cloud.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 text-center text-slate-500 text-xs">
        <p className="mb-2">© 2026 MedSumm AI. All rights reserved.</p>
        <p className="max-w-md mx-auto">
          Disclaimer: This software is designed for analytical and educational purposes only. It is not a replacement for professional clinical advice.
        </p>
      </footer>
    </div>
  );
}
