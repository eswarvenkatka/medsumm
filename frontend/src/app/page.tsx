"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Activity, Brain, FileText, Cpu, ArrowRight, Shield, Database, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden grid-mesh">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-float -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] animate-float -z-10" />
      
      {/* Header */}
      <header className="border-b border-slate-900/60 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Activity className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              MedSumm AI
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center gap-1.5"
              >
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-350 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-slate-900/55"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 relative z-10">
        <section className="relative py-20 md:py-32 flex flex-col items-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {/* Top pill badge */}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 mb-8 animate-fade-in backdrop-blur-md">
              <Brain className="h-3.5 w-3.5 text-indigo-400 animate-pulse" /> clinical AI summaries • RAG Querying
            </span>
            
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] max-w-4xl">
              Understand Complex Medical Records{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-3xl leading-relaxed">
              Deploy MedSumm AI to securely parse diagnostic reports, medical summaries, and DOCX files. Map risk categories, translate jargon, and interact contextually with RAG.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 font-bold text-white transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 group hover:scale-[1.02]"
              >
                Analyze Your First File
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 font-bold text-slate-300 transition-all hover:border-slate-700"
              >
                Explore Features
              </Link>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="mt-16 w-full max-w-4xl p-2 rounded-2xl border border-slate-800/50 bg-slate-900/20 backdrop-blur-sm relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 blur opacity-70" />
              <div className="relative rounded-xl border border-slate-800/80 bg-slate-950 overflow-hidden shadow-2xl">
                <div className="border-b border-slate-900 bg-slate-950/80 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/40" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/40" />
                    <span className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/40" />
                  </div>
                  <div className="mx-auto text-xs font-mono text-slate-500 bg-slate-900/50 px-6 py-1 rounded-md border border-slate-800/50">
                    medsumm-workspace-v1.0
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/60">
                    <p className="text-xs text-indigo-400 font-bold tracking-wider uppercase">Document Intake</p>
                    <div className="flex items-center gap-2 mt-2">
                      <FileText className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-semibold truncate">intake_patient_98.pdf</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/60">
                    <p className="text-xs text-yellow-450 font-bold tracking-wider uppercase">Clinical Evaluation</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-semibold">Medium Risk Identified</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/60">
                    <p className="text-xs text-cyan-400 font-bold tracking-wider uppercase">Active Assistant</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Cpu className="h-5 w-5 text-cyan-400" />
                      <span className="text-sm font-semibold">RAG Index Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 border-t border-slate-900/80 bg-slate-950/40 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Core Clinical Capabilities</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                Engineered with cutting-edge vector embedding systems to provide safe, structured, and fast reports analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl glass-card glass-card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Advanced Extraction</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Support for PDFs and DOCX files. Clean parser extracts plaintext and segments reports into clean, structured categories.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl glass-card glass-card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Clinical Summarization</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Powered by Gemini 2.5 Flash. Delivers structured data covering diagnostic reports, patient assessments, and key medical warnings.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl glass-card glass-card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">RAG Contextual Chat</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Query documents interactively. Text-embedding-004 index vectors stored inside Qdrant Cloud fetch precise relevant context blocks.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950/80 text-center text-slate-500 text-xs relative z-10">
        <p className="mb-3 text-slate-400 font-semibold">© 2026 MedSumm AI. All rights reserved.</p>
        <p className="max-w-xl mx-auto leading-relaxed px-4">
          Disclaimer: This intelligence tool is engineered for clinical analysis support and educational purposes only. It is not an alternative to standard medical validation or diagnostic decisions.
        </p>
      </footer>
    </div>
  );
}
