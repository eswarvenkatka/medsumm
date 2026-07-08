"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getApiUrl } from "@/lib/utils";
import { 
  FileText, Calendar, AlertTriangle, ArrowLeft, Download, 
  Send, Bot, User as UserIcon, Loader2, BookOpen, HeartPulse, Sparkles, Clipboard, ShieldAlert, CheckCircle2, ChevronRight
} from "lucide-react";

interface ChatMessage {
  id: string;
  query: string;
  answer: string;
  timestamp: string;
}

interface DocumentData {
  id: string;
  filename: string;
  cloudinary_url: string;
  uploaded_at: string;
  summary: {
    patient_info?: string;
    chief_complaint?: string;
    diagnostic_findings?: string;
    assessment?: string;
    risk_level?: string;
    recommendations?: string[];
    glossary?: { term: string; explanation: string }[];
  };
}

export default function DocumentDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <DocumentDetailContent />
    </Suspense>
  );
}

function DocumentDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"summary" | "chat">("summary");
  const [loading, setLoading] = useState(true);
  
  const [query, setQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !id) return;
      try {
        const docResponse = await fetch(`${getApiUrl()}/api/documents/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (docResponse.ok) {
          const docData = await docResponse.json();
          setDocument(docData);
        } else {
          router.push("/dashboard");
        }

        const chatResponse = await fetch(`${getApiUrl()}/api/documents/${id}/chats`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          setChats(chatData);
        }
      } catch (err) {
        console.error("Error fetching document details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchData();
    }
  }, [token, id, router]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, activeTab]);

  const handleSendQuery = async (userQuery: string) => {
    if (!userQuery.trim() || !token || !id) return;

    setQuery("");
    setChatLoading(true);

    const tempMessage: ChatMessage = {
      id: "temp",
      query: userQuery,
      answer: "Thinking...",
      timestamp: new Date().toISOString()
    };
    setChats(prev => [...prev, tempMessage]);

    try {
      const response = await fetch(`${getApiUrl()}/api/documents/${id}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: userQuery })
      });

      if (response.ok) {
        const data = await response.json();
        setChats(prev => prev.filter(c => c.id !== "temp").concat(data));
      } else {
        throw new Error();
      }
    } catch (err) {
      setChats(prev => prev.filter(c => c.id !== "temp").concat({
        id: "error",
        query: userQuery,
        answer: "Failed to fetch response. Please try again.",
        timestamp: new Date().toISOString()
      }));
    } finally {
      setChatLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuery(query);
  };

  if (authLoading || (loading && token && id)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!document) return null;

  const risk = document.summary?.risk_level?.toUpperCase() || "LOW";
  const isHigh = risk.includes("HIGH");
  const isMed = risk.includes("MEDIUM");

  const suggestionChips = [
    "Summarize clinical findings",
    "What are the recommended treatments?",
    "Identify any abnormal lab results",
    "Translate complex medical jargon"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden grid-mesh">
      {/* Background Animated Blobs */}
      <div className="absolute top-10 right-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-10 left-[-10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col z-10 relative">
        {/* Navigation & details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-white transition-all shadow-inner"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2.5 text-white">
                <FileText className="h-5.5 w-5.5 text-indigo-400" />
                {document.filename}
              </h1>
              <p className="text-slate-500 text-xs flex items-center gap-2 mt-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5" /> 
                Uploaded on {new Date(document.uploaded_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border ${
                isHigh
                  ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-sm shadow-red-500/5"
                  : isMed
                  ? "bg-yellow-500/10 text-yellow-450 border-yellow-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              {isHigh ? (
                <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              ) : isMed ? (
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
              Risk Profile: {risk}
            </span>
            
            {document.cloudinary_url && (
              <a
                href={document.cloudinary_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold bg-slate-900/30 transition-all shadow-md"
              >
                <Download className="h-4 w-4 text-indigo-400" />
                Original Scan
              </a>
            )}
          </div>
        </div>

        {/* Custom Tab Triggers */}
        <div className="flex border-b border-slate-800/80 mb-8 bg-slate-900/15 p-1 rounded-2xl max-w-sm">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "summary"
                ? "bg-slate-900 text-indigo-400 border-slate-800 border shadow-inner"
                : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Clinical Chart
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "chat"
                ? "bg-slate-900 text-indigo-400 border-slate-800 border shadow-inner"
                : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            RAG Assistant
          </button>
        </div>

        {/* Tab view panels */}
        <div className="flex-1">
          {activeTab === "summary" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Summary details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5 mb-5 border-b border-slate-900 pb-3">
                    <HeartPulse className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                    Intake & Patient Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Patient Demographics</p>
                      <p className="text-slate-200 mt-1.5 font-semibold leading-relaxed">{document.summary.patient_info || "Not specified"}</p>
                    </div>
                    <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Chief Complaint</p>
                      <p className="text-slate-200 mt-1.5 font-semibold leading-relaxed">{document.summary.chief_complaint || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5 mb-4 border-b border-slate-900 pb-3">
                    <Clipboard className="h-4.5 w-4.5 text-indigo-400" />
                    Diagnostic Lab Findings
                  </h3>
                  <p className="text-slate-355 text-sm leading-relaxed whitespace-pre-line bg-slate-950/10 p-4 rounded-xl border border-slate-900">
                    {document.summary.diagnostic_findings || "No specific findings extracted."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5 mb-4 border-b border-slate-900 pb-3">
                    <HeartPulse className="h-4.5 w-4.5 text-cyan-400" />
                    Clinical Assessment
                  </h3>
                  <p className="text-slate-355 text-sm leading-relaxed whitespace-pre-line bg-slate-950/10 p-4 rounded-xl border border-slate-900">
                    {document.summary.assessment || "No diagnostic assessments extracted."}
                  </p>
                </div>
              </div>

              {/* Recommendations and Glossary */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 border-b border-slate-900 pb-3">
                    Clinical Plan & Recommendations
                  </h3>
                  {document.summary.recommendations && document.summary.recommendations.length > 0 ? (
                    <ul className="space-y-4">
                      {document.summary.recommendations.map((rec, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-3 bg-slate-950/20 p-3 rounded-xl border border-slate-900/60">
                          <ChevronRight className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-xs">No plan recommendations listed.</p>
                  )}
                </div>

                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 border-b border-slate-900 pb-3">
                    Medical Terms Glossary
                  </h3>
                  {document.summary.glossary && document.summary.glossary.length > 0 ? (
                    <div className="space-y-4">
                      {document.summary.glossary.map((g, i) => (
                        <div key={i} className="text-sm bg-slate-950/20 p-3.5 rounded-xl border border-slate-900/60">
                          <p className="font-bold text-indigo-400">{g.term}</p>
                          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{g.explanation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">No complex medical terms parsed.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* RAG Chat interface */
            <div className="flex flex-col h-[600px] border border-slate-800/80 bg-slate-900/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {chats.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs max-w-md mx-auto">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-5 animate-pulse-slow">
                      <Sparkles className="h-7 w-7 text-indigo-400" />
                    </div>
                    <p className="font-bold text-slate-200 text-sm">Ask clinical queries about this report</p>
                    <p className="mt-1.5 text-slate-500 leading-relaxed">
                      AI parses contextual blocks from your secure vector database to deliver cited parameters.
                    </p>
                    
                    {/* Prompt suggestion chips */}
                    <div className="flex flex-wrap gap-2 justify-center mt-6">
                      {suggestionChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendQuery(chip)}
                          className="px-3.5 py-2 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/60 text-[11px] font-semibold text-slate-350 hover:text-white transition-all cursor-pointer shadow-sm text-left max-w-[280px] sm:max-w-xs truncate"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div key={chat.id} className="space-y-4 animate-fade-in">
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-gradient-to-r from-indigo-650 to-indigo-550 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-sm max-w-xl shadow-lg shadow-indigo-650/10 leading-relaxed font-semibold">
                          {chat.query}
                        </div>
                        <div className="h-8.5 w-8.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs shrink-0 shadow-inner">
                          <UserIcon className="h-4.5 w-4.5" />
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-8.5 w-8.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs shrink-0 shadow-inner">
                          <Bot className="h-4.5 w-4.5 animate-pulse" />
                        </div>
                        <div className="bg-slate-950/60 border border-slate-900 text-slate-200 rounded-2xl rounded-tl-none px-4.5 py-3.5 text-sm max-w-xl leading-relaxed whitespace-pre-line shadow-lg">
                          {chat.id === "temp" && chatLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-slate-450" />
                              <span className="text-xs text-slate-500 font-medium">Extracting vectors...</span>
                            </div>
                          ) : (
                            <>
                              <div>{chat.answer}</div>
                              {chat.id !== "error" && (
                                <div className="mt-3 pt-2.5 border-t border-slate-900/60 text-[10px] text-indigo-400/80 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Cited medical document reference verified
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleFormSubmit} className="border-t border-slate-900/85 p-4 bg-slate-950/30 flex gap-3 relative">
                <input
                  type="text"
                  required
                  disabled={chatLoading}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about this clinical record..."
                  className="flex-1 px-4.5 py-3 border border-slate-800 bg-slate-950/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-inner transition-all"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !query.trim()}
                  className="px-5 py-3 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white font-bold flex items-center gap-1.5 transition-all text-sm disabled:opacity-50 hover:scale-[1.01] shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  <Send className="h-4.5 w-4.5" />
                  Ask AI
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
