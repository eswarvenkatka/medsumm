"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User as UserIcon, Loader2, Sparkles, CheckCircle2, Shield, ArrowRight } from "lucide-react";
import SriHospitalLogo from "@/components/ui/SriHospitalLogo";

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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F4F6F8] text-slate-800 overflow-hidden relative">
      {/* Background soft natural gradients */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[#009F93]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-[#0A4E7A]/5 rounded-full blur-3xl -z-10" />

      {/* Left panel: Showcase (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:col-span-6 bg-white border-r border-[rgba(10,78,122,0.08)] p-12 flex-col justify-between relative overflow-hidden grid-mesh">
        {/* Brand logo header */}
        <div className="flex items-center gap-2">
          <SriHospitalLogo size={36} showTagline={false} />
        </div>

        {/* Feature Highlights */}
        <div className="my-auto max-w-md space-y-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#009F93]/10 text-[#009F93] border border-[#009F93]/20">
            <Sparkles className="h-3 w-3 animate-pulse text-[#C8634A]" /> Create Portal Account
          </span>
          <h2 className="text-4xl font-black tracking-tight leading-tight text-[#0A4E7A]">
            Join Sri Hospital Patient Care Desk
          </h2>
          <p className="text-slate-500 leading-relaxed text-sm">
            Create an account to securely book appointments, retrieve lab reports, consult clinical history summaries, and direct queries to our doctors.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#009F93]/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-[#009F93]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0A4E7A]">Clinical Records Tracking</p>
                <p className="text-xs text-slate-400 mt-0.5">Maintain isolated medical summaries and secure diagnostics data histories.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#009F93]/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-[#009F93]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0A4E7A]">Direct Medical Messaging</p>
                <p className="text-xs text-slate-400 mt-0.5">Communicate directly with consulting specialists about report metrics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
          Authorized personnel only. Data connections are encrypted via TLS and Google Cloud secure credentials.
        </p>
      </div>

      {/* Right panel: Registration form */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 p-8 sm:p-10 rounded-3xl bg-white border border-[rgba(10,78,122,0.1)] shadow-xl relative">
          
          {/* Logo Highlight Card */}
          <div className="flex flex-col items-center text-center">
            {/* Highlight container with border & shadow */}
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[rgba(10,78,122,0.12)] shadow-md mb-6 inline-block hover:scale-105 transition-transform duration-300">
              <SriHospitalLogo size={52} showText={true} />
            </div>
            
            <h2 className="text-2xl font-black text-[#0A4E7A]">
              Create Account
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Register for Clinical Portal
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-650 text-xs text-center font-semibold animate-shake">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-500 mb-2 uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-[rgba(10,78,122,0.12)] bg-[#F8F9FA] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm transition-all"
                    placeholder="Patient / Staff Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-500 mb-2 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-[rgba(10,78,122,0.12)] bg-[#F8F9FA] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-500 mb-2 uppercase">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-[rgba(10,78,122,0.12)] bg-[#F8F9FA] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm transition-all"
                    placeholder="•••••••• (min 6 chars)"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#0A4E7A] to-[#009F93] hover:from-[#0D6197] hover:to-[#008076] py-3.5 px-4 text-sm font-bold text-white shadow-md shadow-[#0A4E7A]/20 transition-all hover:scale-[1.01] disabled:opacity-50"
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

          <div className="text-center text-xs text-slate-500 font-semibold mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#009F93] hover:text-[#0A4E7A] transition-colors underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
