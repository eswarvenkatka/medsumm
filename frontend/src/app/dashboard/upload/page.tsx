"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getApiUrl } from "@/lib/utils";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle, Sparkles, Brain, Database, ArrowLeft } from "lucide-react";

type UploadState = "idle" | "uploading" | "parsing" | "summarizing" | "indexing" | "completed" | "error";

export default function UploadPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "docx" && ext !== "doc") {
        setErrorMsg("Unsupported format. Please select a PDF or DOCX file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setErrorMsg("");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleUploadSubmit called. File:", file?.name, "Token exists:", !!token);
    if (!file) {
      setErrorMsg("No file selected. Please select a PDF or DOCX file to proceed.");
      return;
    }
    if (!token) {
      console.warn("Upload blocked: Token is missing");
      setErrorMsg("Authentication token is missing or loading. Please wait a moment, refresh the page, or sign out and sign in again.");
      return;
    }

    setUploadState("uploading");
    setProgress(20);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const timer1 = setTimeout(() => {
        setUploadState("parsing");
        setProgress(40);
      }, 1500);

      const timer2 = setTimeout(() => {
        setUploadState("indexing");
        setProgress(60);
      }, 3000);

      const timer3 = setTimeout(() => {
        setUploadState("summarizing");
        setProgress(80);
      }, 4500);

      console.log("Sending POST request to:", `${getApiUrl()}/api/documents/upload`);
      const response = await fetch(`${getApiUrl()}/api/documents/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (response.ok) {
        console.log("Upload succeeded. Redirecting...");
        setProgress(100);
        setUploadState("completed");
        const docData = await response.json();
        
        setTimeout(() => {
          router.push(`/dashboard/documents/detail?id=${docData.id}`);
        }, 1200);
      } else {
        const errorData = await response.json();
        console.error("Upload failed with status:", response.status, errorData);
        throw new Error(errorData.detail || "Upload process failed.");
      }
    } catch (err: any) {
      console.error("Upload error caught:", err);
      setErrorMsg(err.message || "Failed to process and index the document.");
      setUploadState("error");
      setProgress(0);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden grid-mesh">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full flex flex-col justify-center relative z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 blur opacity-60 pointer-events-none" />
          
          <div className="text-center mb-8 relative">
            <h1 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
              <UploadCloud className="h-6 w-6 text-indigo-400" /> Upload Medical Record
            </h1>
            <p className="text-slate-450 text-xs mt-1.5 max-w-md mx-auto">
              Provide a PDF or DOCX clinical summary. The AI will securely parse parameters, analyze risk tags, and initialize semantic vectors.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              {errorMsg}
            </div>
          )}

          {uploadState === "idle" || uploadState === "error" ? (
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-12 text-center transition-all bg-slate-950/30 relative group cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                <div className="relative z-0">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform duration-300">
                    <UploadCloud className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  
                  {file ? (
                    <div className="space-y-2">
                      <p className="text-indigo-400 font-bold text-sm flex items-center justify-center gap-2 bg-indigo-500/5 border border-indigo-500/10 px-4 py-2 rounded-xl max-w-sm mx-auto">
                        <FileText className="h-4.5 w-4.5" /> {file.name}
                      </p>
                      <p className="text-slate-500 text-xs font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-200 font-bold text-sm">Drag and drop file here, or click to browse</p>
                      <p className="text-slate-500 text-xs mt-1.5">PDF or Word clinical documents (Max size 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!file}
                className="w-full py-3.5 rounded-xl bg-[#3B7E96] hover:bg-[#2F657A] text-white font-bold transition-all shadow-lg shadow-[#3B7E96]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Proceed
              </button>
            </form>
          ) : (
            <div className="py-10 text-center space-y-8 relative">
              <div className="flex justify-center">
                {uploadState === "completed" ? (
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
                    <Loader2 className="h-16 w-16 text-indigo-400 animate-spin relative" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white capitalize flex items-center justify-center gap-2">
                  {uploadState === "uploading" && (
                    <>
                      <UploadCloud className="h-4 w-4 text-indigo-400" /> Uploading clinical file...
                    </>
                  )}
                  {uploadState === "parsing" && (
                    <>
                      <FileText className="h-4 w-4 text-cyan-400" /> Parsing plaintext markers...
                    </>
                  )}
                  {uploadState === "indexing" && (
                    <>
                      <Database className="h-4 w-4 text-purple-400" /> Indexing Qdrant segments...
                    </>
                  )}
                  {uploadState === "summarizing" && (
                    <>
                      <Brain className="h-4 w-4 text-indigo-400" /> Compiling clinical evaluation...
                    </>
                  )}
                  {uploadState === "completed" && (
                    <>
                      <Sparkles className="h-4 w-4 text-emerald-400" /> Indexation Completed!
                    </>
                  )}
                </h3>
                <p className="text-slate-450 text-xs">Isolating report context. Please do not refresh this page.</p>
              </div>

              {/* Progress step bar */}
              <div className="space-y-3 max-w-md mx-auto">
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/80 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full transition-all duration-700 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  <span>Intake</span>
                  <span className={`${progress >= 40 ? "text-indigo-400" : ""}`}>Parse</span>
                  <span className={`${progress >= 60 ? "text-purple-400" : ""}`}>Embed</span>
                  <span className={`${progress >= 80 ? "text-cyan-400" : ""}`}>Summarize</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
