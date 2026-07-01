"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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
    if (!file || !token) return;

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/documents/upload`, {
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
        setProgress(100);
        setUploadState("completed");
        const docData = await response.json();
        
        setTimeout(() => {
          router.push(`/dashboard/documents/detail?id=${docData.id}`);
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload process failed.");
      }
    } catch (err: any) {
      console.error(err);
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
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full flex flex-col justify-center">
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Upload Medical Report</h1>
            <p className="text-slate-400 text-xs mt-1">
              Upload PDF or DOCX medical records. They will be securely parsed, summarized, and indexed.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {uploadState === "idle" || uploadState === "error" ? (
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-10 text-center transition-all bg-slate-950/20 relative group">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <UploadCloud className="h-12 w-12 text-slate-500 mx-auto mb-4 group-hover:text-indigo-400 transition-colors" />
                
                {file ? (
                  <div className="space-y-1">
                    <p className="text-indigo-400 font-semibold text-sm flex items-center justify-center gap-1.5">
                      <FileText className="h-4 w-4" /> {file.name}
                    </p>
                    <p className="text-slate-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-300 font-semibold text-sm">Drag and drop file here, or click to select</p>
                    <p className="text-slate-500 text-xs mt-1">PDF or DOCX documents (Max size 10MB)</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Processing
              </button>
            </form>
          ) : (
            <div className="py-10 text-center space-y-6">
              <div className="flex justify-center">
                {uploadState === "completed" ? (
                  <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
                ) : (
                  <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white capitalize">
                  {uploadState === "uploading" && "Uploading document..."}
                  {uploadState === "parsing" && "Extracting text content..."}
                  {uploadState === "indexing" && "Indexing vectors to Qdrant..."}
                  {uploadState === "summarizing" && "Generating structured summary..."}
                  {uploadState === "completed" && "Document analyzed!"}
                </h3>
                <p className="text-slate-400 text-xs">Please do not close this window while processing is active.</p>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-600 h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
