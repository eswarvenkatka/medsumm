"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getApiUrl } from "@/lib/utils";
import { 
  FileText, Calendar, AlertTriangle, ArrowLeft, Download, 
  Send, Bot, User as UserIcon, Loader2, BookOpen, HeartPulse, Sparkles
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

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !token || !id) return;

    const userQuery = query;
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

  if (authLoading || (loading && !document)) {
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col">
        {/* Navigation & details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-indigo-400" />
                {document.filename}
              </h1>
              <p className="text-slate-500 text-xs flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" /> 
                Uploaded on {new Date(document.uploaded_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                isHigh
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : isMed
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  : "bg-green-500/10 text-green-400 border-green-500/20"
              }`}
            >
              {(isHigh || isMed) && <AlertTriangle className="h-3.5 w-3.5" />}
              Risk: {risk}
            </span>
            
            {document.cloudinary_url && (
              <a
                href={document.cloudinary_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold bg-slate-900/30 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Original File
              </a>
            )}
          </div>
        </div>

        {/* Custom Tab Triggers */}
        <div className="flex border-b border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "summary"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Clinical Summary
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "chat"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Medical Chat (RAG)
          </button>
        </div>

        {/* Tab view panels */}
        <div className="flex-1">
          {activeTab === "summary" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Summary details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                    <HeartPulse className="h-4 w-4 text-indigo-400" />
                    Patient Information & Intake Context
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Patient Context</p>
                      <p className="text-slate-200 mt-0.5">{document.summary.patient_info || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Chief Complaint</p>
                      <p className="text-slate-200 mt-0.5">{document.summary.chief_complaint || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20">
                  <h3 className="text-base font-bold text-white mb-3">Diagnostic Findings & Labs</h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {document.summary.diagnostic_findings || "No specific findings extracted."}
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20">
                  <h3 className="text-base font-bold text-white mb-3">Clinical Assessment</h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {document.summary.assessment || "No diagnostic assessments extracted."}
                  </p>
                </div>
              </div>

              {/* Recommendations and Glossary */}
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-slate-850 bg-slate-900/30">
                  <h3 className="text-base font-bold text-white mb-4">Plan & Recommendations</h3>
                  {document.summary.recommendations && document.summary.recommendations.length > 0 ? (
                    <ul className="space-y-3">
                      {document.summary.recommendations.map((rec, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-xs">No plan recommendations listed.</p>
                  )}
                </div>

                <div className="p-6 rounded-xl border border-slate-850 bg-slate-900/30">
                  <h3 className="text-base font-bold text-white mb-4">Patient-Friendly Glossary</h3>
                  {document.summary.glossary && document.summary.glossary.length > 0 ? (
                    <div className="space-y-4">
                      {document.summary.glossary.map((g, i) => (
                        <div key={i} className="text-sm">
                          <p className="font-semibold text-indigo-400">{g.term}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{g.explanation}</p>
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
            <div className="flex flex-col h-[500px] border border-slate-800 bg-slate-900/10 rounded-xl overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {chats.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                    <Sparkles className="h-8 w-8 text-slate-700 mb-2" />
                    <p className="font-medium">Ask questions about this report</p>
                    <p className="mt-1 max-w-xs">AI will retrieve matching text passages to generate answers contextually.</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div key={chat.id} className="space-y-4">
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-indigo-600/90 text-white rounded-2xl rounded-tr-none px-4 py-2 text-sm max-w-xl">
                          {chat.query}
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs shrink-0">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm max-w-xl leading-relaxed whitespace-pre-line">
                          {chat.id === "temp" && chatLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400 animate-pulse" />
                          ) : (
                            chat.answer
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendQuery} className="border-t border-slate-800 p-4 bg-slate-950/40 flex gap-3">
                <input
                  type="text"
                  required
                  disabled={chatLoading}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about this clinical record..."
                  className="flex-1 px-4 py-2 border border-slate-850 bg-slate-950/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !query.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-all text-sm disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
