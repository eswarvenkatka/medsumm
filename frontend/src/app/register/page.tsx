"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Activity, Mail, Lock, User as UserIcon, Loader2, Sparkles, CheckCircle2, Shield, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, password, name);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account. Please check inputs.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl -z-10" />

      {/* Left panel: Product showcase (Hidden on small screens) */}
      <div className="hidden lg:flex lg:col-span-7 bg-slate-900/20 border-r border-slate-900/60 p-12 flex-col justify-between relative overflow-hidden grid-mesh">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        
        {/* Brand logo */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center">
            <Activity className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            MedSumm AI
          </span>
        </div>

        {/* Dynamic preview mockup */}
        <div className="my-auto max-w-lg space-y-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Sparkles className="h-3 w-3 animate-pulse text-indigo-400" /> Create Professional Account
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Secure clinical summarization workspaces
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm md:text-base">
            Gain instant diagnostics analysis. Support for clinical PDF & Word records. Multi-layered index algorithms inside a secure vector cloud.
          </p>

          {/* Bullet points */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Patient-Friendly Glossary Translations</p>
                <p className="text-xs text-slate-500 mt-0.5">Demystifies medical terminologies and complex lab parameters automatically.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Shield className="h-3 w-3 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Full EHR Integrity</p>
                <p className="text-xs text-slate-500 mt-0.5">Maintain isolated data states and secure original document URLs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
          Authorized personnel only. Data connection is encrypted via Firestore and Qdrant secure credentials.
        </p>
      </div>

      {/* Right panel: Registration form */}
      <div className="lg:col-span-5 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8 p-8 rounded-3xl bg-slate-900/45 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-3xl -z-10" />

          {/* Small Logo for Mobile/Tablet */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="lg:hidden h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Join the clinical summarization platform
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-wide text-slate-400 mb-1.5 uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 border border-slate-800 bg-slate-950/60 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all shadow-inner"
                    placeholder="Dr. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wide text-slate-400 mb-1.5 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 border border-slate-800 bg-slate-950/60 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all shadow-inner"
                    placeholder="name@hospital.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wide text-slate-400 mb-1.5 uppercase">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 border border-slate-800 bg-slate-950/60 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all shadow-inner"
                    placeholder="•••••••• (min 6 chars)"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50 hover:scale-[1.01]"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <>
                    <span>Sign Up</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
