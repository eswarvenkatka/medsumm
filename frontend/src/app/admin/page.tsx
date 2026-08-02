"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getApiUrl } from "@/lib/utils";
import { 
  ShieldAlert, Users, FileText, Database, 
  Loader2, AlertTriangle, Eye, Trash2, 
  Search, Filter, CheckCircle2, UserCheck, 
  X, Check, AlertCircle, RefreshCw, Activity, Edit2, Calendar
} from "lucide-react";

interface AdminStats {
  total_users: number;
  total_documents: number;
  total_chunks_indexed: number;
  risk_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  recent_uploads: {
    id: string;
    filename: string;
    uploaded_at: string;
    user_id: string;
    risk_level: string;
  }[];
}

interface UserAccount {
  uid: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface DocSummary {
  id: string;
  filename: string;
  uploaded_at: string;
  summary?: {
    risk_level?: string;
    patient_info?: string;
  };
  user_id: string;
}

export default function AdminPage() {
  const { user, token, role, loading: authLoading } = useAuth();
  const router = useRouter();

  // Tabs: overview, users, data, doctors, appointments
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "data" | "doctors" | "appointments">("overview");

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [documents, setDocuments] = useState<DocSummary[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Loading and error states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [docSearch, setDocSearch] = useState("");
  const [docRiskFilter, setDocRiskFilter] = useState("ALL");

  // Modals for confirmation
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocSummary | null>(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Doctor creation form state
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    qualification: "",
    specialization: "",
    experience: "",
    hospital: "",
    city: "",
    contact_number: "",
    email: "",
    consultation_fee: 0,
    about_doctor: ""
  });

  const [doctorToEdit, setDoctorToEdit] = useState<any | null>(null);

  const handleCloseDoctorModal = () => {
    setShowAddDoctorModal(false);
    setDoctorToEdit(null);
    setDoctorForm({
      name: "",
      qualification: "",
      specialization: "",
      experience: "",
      hospital: "",
      city: "",
      contact_number: "",
      email: "",
      consultation_fee: 0,
      about_doctor: ""
    });
  };

  const isAdmin = user?.email === "esw28351@gmail.com";

  // Authorization check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        const timer = setTimeout(() => {
          if (!isAdmin) {
            router.push("/dashboard");
          } else {
            setAuthorized(true);
          }
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setAuthorized(true);
      }
    }
  }, [user, authLoading, role, isAdmin, router]);

  // Fetching System Overview Stats
  const fetchAdminStats = async () => {
    if (!token || !authorized) return;
    setLoadingStats(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/stats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      showNotification("error", "Failed to retrieve overview statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetching Users
  const fetchUsers = async () => {
    if (!token || !authorized) return;
    setLoadingUsers(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        showNotification("error", "Failed to fetch users list.");
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      showNotification("error", "Network error while loading users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetching Documents (all summaries)
  const fetchDocuments = async () => {
    if (!token || !authorized) return;
    setLoadingDocs(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/summaries`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        showNotification("error", "Failed to fetch clinical summaries audit list.");
      }
    } catch (err) {
      console.error("Failed to load summaries:", err);
      showNotification("error", "Network error while loading reports.");
    } finally {
      setLoadingDocs(false);
    }
  };

  // Fetching Doctors
  const fetchDoctors = async () => {
    if (!token || !authorized) return;
    setLoadingDoctors(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/doctors`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      } else {
        showNotification("error", "Failed to fetch doctors list.");
      }
    } catch (err) {
      console.error("Failed to load doctors:", err);
      showNotification("error", "Network error while loading doctors.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Trigger data loads when tab changes or authorized status changes
  useEffect(() => {
    if (token && authorized) {
      if (activeTab === "overview") {
        fetchAdminStats();
      } else if (activeTab === "users") {
        fetchUsers();
      } else if (activeTab === "data") {
        fetchDocuments();
      } else if (activeTab === "doctors") {
        fetchDoctors();
      } else if (activeTab === "appointments") {
        fetchAppointments();
      }
    }
  }, [token, authorized, activeTab]);

  // Fetching Appointments
  const fetchAppointments = async () => {
    if (!token || !authorized) return;
    setLoadingAppointments(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/appointments`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        showNotification("error", "Failed to fetch appointments list.");
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
      showNotification("error", "Network error while loading appointments.");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appId: string, status: string) => {
    if (!token) return;
    setActionLoading(`update-appointment-${appId}`);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/appointments/${appId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        showNotification("success", `Appointment status updated to ${status}.`);
        fetchAppointments();
      } else {
        showNotification("error", "Failed to update appointment status.");
      }
    } catch (err) {
      showNotification("error", "Error communicating with server.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAppointment = async (appId: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    setActionLoading(`delete-appointment-${appId}`);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/appointments/${appId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        showNotification("success", "Appointment deleted successfully.");
        fetchAppointments();
      } else {
        showNotification("error", "Failed to delete appointment.");
      }
    } catch (err) {
      showNotification("error", "Error communicating with server.");
    } finally {
      setActionLoading(null);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading("create-doctor");
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(doctorForm)
      });
      if (response.ok) {
        showNotification("success", "Doctor profile created successfully.");
        setShowAddDoctorModal(false);
        setDoctorForm({
          name: "",
          qualification: "",
          specialization: "",
          experience: "",
          hospital: "",
          city: "",
          contact_number: "",
          email: "",
          consultation_fee: 0,
          about_doctor: ""
        });
        fetchDoctors();
      } else {
        const errData = await response.json();
        showNotification("error", errData.detail || "Failed to create doctor profile.");
      }
    } catch (err) {
      showNotification("error", "Error communicating with the server.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !doctorToEdit) return;
    setActionLoading(`update-doctor-${doctorToEdit.id}`);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/doctors/${doctorToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(doctorForm)
      });
      if (response.ok) {
        showNotification("success", "Doctor profile updated successfully.");
        setShowAddDoctorModal(false);
        setDoctorToEdit(null);
        setDoctorForm({
          name: "",
          qualification: "",
          specialization: "",
          experience: "",
          hospital: "",
          city: "",
          contact_number: "",
          email: "",
          consultation_fee: 0,
          about_doctor: ""
        });
        fetchDoctors();
      } else {
        const errData = await response.json();
        showNotification("error", errData.detail || "Failed to update doctor profile.");
      }
    } catch (err) {
      showNotification("error", "Error communicating with the server.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDoctor = async (docId: string) => {
    if (!token) return;
    setActionLoading(`delete-doctor-${docId}`);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/doctors/${docId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification("success", "Doctor profile deleted successfully.");
        setDoctors(doctors.filter(d => d.id !== docId));
      } else {
        showNotification("error", "Failed to delete doctor.");
      }
    } catch (err) {
      showNotification("error", "Network error during deletion.");
    } finally {
      setActionLoading(null);
    }
  };

  // CRUD: Update User Role
  const handleUpdateRole = async (uid: string, newRole: string) => {
    if (!token) return;
    setActionLoading(`role-${uid}`);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/users/${uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        showNotification("success", `User role updated to ${newRole}.`);
        setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        // If stats tab needs refreshing, trigger it in the background
        fetchAdminStats();
      } else {
        showNotification("error", "Failed to update user role.");
      }
    } catch (err) {
      showNotification("error", "Error contacting administrative endpoint.");
    } finally {
      setActionLoading(null);
    }
  };

  // CRUD: Delete User Account
  const handleDeleteUser = async (uid: string) => {
    if (!token) return;
    setActionLoading(`delete-user-${uid}`);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/users/${uid}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification("success", "User account and all clinical summaries successfully deleted.");
        setUsers(users.filter(u => u.uid !== uid));
        setUserToDelete(null);
        fetchAdminStats();
      } else {
        showNotification("error", "Failed to delete user account.");
      }
    } catch (err) {
      showNotification("error", "Network error during deletion.");
    } finally {
      setActionLoading(null);
    }
  };

  // CRUD: Delete Document
  const handleDeleteDoc = async (docId: string) => {
    if (!token) return;
    setActionLoading(`delete-doc-${docId}`);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/documents/${docId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification("success", "Clinical report purged from Firestore and Qdrant index.");
        setDocuments(documents.filter(d => d.id !== docId));
        setDocToDelete(null);
        fetchAdminStats();
      } else {
        showNotification("error", "Failed to delete report.");
      }
    } catch (err) {
      showNotification("error", "Network error during document purge.");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || (loadingStats && !stats && activeTab === "overview" && token && authorized)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-center p-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 text-sm mt-1 max-w-sm">
          You do not have administrative privileges to view this page. Redirecting...
        </p>
      </div>
    );
  }

  // Filter calculations
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = d.filename.toLowerCase().includes(docSearch.toLowerCase()) || 
                          (d.summary?.patient_info || "").toLowerCase().includes(docSearch.toLowerCase());
    const risk = d.summary?.risk_level?.toUpperCase() || "LOW";
    const matchesRisk = docRiskFilter === "ALL" || 
                        (docRiskFilter === "HIGH" && risk.includes("HIGH")) ||
                        (docRiskFilter === "MEDIUM" && risk.includes("MEDIUM")) ||
                        (docRiskFilter === "LOW" && (risk.includes("LOW") || risk.includes("NORMAL")));
    return matchesSearch && matchesRisk;
  });

  // Risk distribution for Overview charts
  const highRisk = stats?.risk_distribution.high ?? 0;
  const medRisk = stats?.risk_distribution.medium ?? 0;
  const lowRisk = stats?.risk_distribution.low ?? 0;
  const totalRisks = (highRisk + medRisk + lowRisk) || 1;
  
  const highPercent = Math.round((highRisk / totalRisks) * 100);
  const medPercent = Math.round((medRisk / totalRisks) * 100);
  const lowPercent = Math.round((lowRisk / totalRisks) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Dynamic Background Design */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[100px] -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10">
        
        {/* Alerts / Toasts */}
        {notification && (
          <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl flex items-center gap-3 border shadow-2xl animate-fade-in transition-all ${
            notification.type === "success" 
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/30" 
              : "bg-red-950/90 text-red-300 border-red-500/30"
          }`}>
            {notification.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-red-400" />}
            <span className="text-sm font-semibold">{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-indigo-500 flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-indigo-500" />
              Administrative Workspace
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Oversee the clinical document summarization portal, user access rules, and indexed databases.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (activeTab === "overview") fetchAdminStats();
                else if (activeTab === "users") fetchUsers();
                else if (activeTab === "data") fetchDocuments();
                else if (activeTab === "doctors") fetchDoctors();
                else if (activeTab === "appointments") fetchAppointments();
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0A4E7A] hover:text-[#009F93] cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 mb-8 overflow-x-auto whitespace-nowrap gap-1 select-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Activity className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-3 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "users"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Users className="h-4 w-4" />
            User Accounts
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`px-5 py-3 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "data"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <FileText className="h-4 w-4" />
            Clinical Data
          </button>
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-5 py-3 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "doctors"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Doctors Registry
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-5 py-3 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "appointments"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Appointments
          </button>
        </div>

        {/* TAB CONTENT: OVERVIEW */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8 animate-fade-in">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">Total Users</p>
                  <h3 className="text-3xl font-extrabold mt-2 text-[#0A4E7A]">{stats.total_users}</h3>
                </div>
                <Users className="h-10 w-10 text-indigo-500/25" />
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">Total Reports</p>
                  <h3 className="text-3xl font-extrabold mt-2 text-[#0A4E7A]">{stats.total_documents}</h3>
                </div>
                <FileText className="h-10 w-10 text-cyan-500/25" />
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">Indexed Chunks</p>
                  <h3 className="text-3xl font-extrabold mt-2 text-[#0A4E7A]">{stats.total_chunks_indexed}</h3>
                </div>
                <Database className="h-10 w-10 text-emerald-500/25" />
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">Risk Level Ratio</p>
                  <h3 className="text-3xl font-extrabold mt-2 text-red-500">
                    {highPercent}% <span className="text-[#475569] text-sm font-normal">High</span>
                  </h3>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-500/25" />
              </div>
            </div>

            {/* Overview Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Risk Distribution Chart */}
              <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h3 className="text-base font-bold text-[#0A4E7A] mb-6">Clinical Risk Level Ratio</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-red-400">High Risk ({highRisk})</span>
                      <span>{highPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-red-500 h-full" style={{ width: `${highPercent}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-yellow-400">Medium Risk ({medRisk})</span>
                      <span>{medPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-yellow-500 h-full" style={{ width: `${medPercent}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-green-400">Low Risk ({lowRisk})</span>
                      <span>{lowPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-green-500 h-full" style={{ width: `${lowPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Uploads List */}
              <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h3 className="text-base font-bold text-[#0A4E7A] mb-4">Recent Global Uploads</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">File Name</th>
                        <th className="py-3 px-4">Upload Date</th>
                        <th className="py-3 px-4">User ID</th>
                        <th className="py-3 px-4">Risk Level</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {stats.recent_uploads.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold">No recent uploads detected.</td>
                        </tr>
                      ) : (
                        stats.recent_uploads.map((doc) => {
                          const riskStr = doc.risk_level?.toUpperCase() || "LOW";
                          const isHigh = riskStr.includes("HIGH");
                          const isMed = riskStr.includes("MEDIUM");
                          
                          return (
                            <tr key={doc.id} className="hover:bg-slate-905/10 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-800">{doc.filename}</td>
                              <td className="py-3.5 px-4 text-slate-400">
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 truncate max-w-[100px] font-mono">{doc.user_id}</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold border text-[10px] ${
                                  isHigh
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : isMed
                                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                    : "bg-green-500/10 text-green-400 border-green-500/20"
                                }`}>
                                  {riskStr}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => router.push(`/dashboard/documents/detail?id=${doc.id}`)}
                                  className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-white transition-all cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: USER ACCOUNTS */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="relative w-full sm:max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-[#F8F9FA] rounded-xl text-sm placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-850 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 bg-[#F8F9FA] border border-slate-200 rounded-xl px-3.5 py-2">
                <Filter className="h-4 w-4 text-indigo-500" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="text-slate-700 bg-white">All Roles</option>
                  <option value="admin" className="text-slate-700 bg-white">Administrator</option>
                  <option value="user" className="text-slate-700 bg-white">Physician / User</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0A4E7A] flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#009F93]" /> User Registry
                </h2>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {loadingUsers ? "Loading..." : `${filteredUsers.length} total users`}
                </span>
              </div>

              {loadingUsers && users.length === 0 ? (
                <div className="py-24 text-center">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">Querying workspace database...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-24 text-center">
                  <Users className="h-14 w-14 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">No registered users matched criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-550 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6">Access Role</th>
                        <th className="py-4 px-6">Registration Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {filteredUsers.map((u) => {
                        const isSelf = u.uid === user?.uid;
                        const isSystemAdmin = u.email === "esw28351@gmail.com";
                        const isLoading = actionLoading === `role-${u.uid}`;
                        
                        return (
                          <tr key={u.uid} className="hover:bg-slate-900/10 transition-colors text-sm">
                            <td className="py-4.5 px-6 font-bold text-slate-100 flex items-center gap-2">
                              {u.name}
                              {u.role === "admin" && (
                                <span className="bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold">Admin</span>
                              )}
                            </td>
                            <td className="py-4.5 px-6 text-slate-400 font-medium font-mono text-xs">{u.email}</td>
                            <td className="py-4.5 px-6">
                              {isSelf || isSystemAdmin ? (
                                <span className="text-slate-500 text-xs font-semibold italic">System Protected</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={u.role}
                                    disabled={isLoading}
                                    onChange={(e) => handleUpdateRole(u.uid, e.target.value)}
                                    className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                                  >
                                    <option value="user">Physician / User</option>
                                    <option value="admin">Administrator</option>
                                  </select>
                                  {isLoading && <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />}
                                </div>
                              )}
                            </td>
                            <td className="py-4.5 px-6 text-slate-400 font-medium">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Prior Session"}
                            </td>
                            <td className="py-4.5 px-6 text-right">
                              {isSelf || isSystemAdmin ? (
                                <span className="text-xs text-slate-500">-</span>
                              ) : (
                                <button
                                  disabled={actionLoading !== null}
                                  onClick={() => setUserToDelete(u)}
                                  className="p-2 rounded-lg border border-slate-800 hover:border-red-500/30 bg-slate-950 text-slate-500 hover:text-red-400 transition-all cursor-pointer disabled:opacity-55"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: CLINICAL DATA */}
        {activeTab === "data" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="relative w-full sm:max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search summaries by filename or patient..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-[#F8F9FA] rounded-xl text-sm placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-850 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 bg-[#F8F9FA] border border-slate-200 rounded-xl px-3.5 py-2">
                <Filter className="h-4 w-4 text-indigo-500" />
                <select
                  value={docRiskFilter}
                  onChange={(e) => setDocRiskFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="text-slate-700 bg-white">All Risks</option>
                  <option value="HIGH" className="text-slate-700 bg-white">Critical / High</option>
                  <option value="MEDIUM" className="text-slate-700 bg-white">Moderate / Medium</option>
                  <option value="LOW" className="text-slate-700 bg-white">Stable / Low</option>
                </select>
              </div>
            </div>

            {/* Reports Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0A4E7A] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#009F93]" /> Global Patient Summaries Register
                </h2>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {loadingDocs ? "Loading..." : `${filteredDocs.length} total uploads`}
                </span>
              </div>

              {loadingDocs && documents.length === 0 ? (
                <div className="py-24 text-center">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">Querying vector index metadata...</p>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="py-24 text-center">
                  <FileText className="h-14 w-14 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">No indexed summaries found matching parameters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-550 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Filename</th>
                        <th className="py-4 px-6">Upload Date</th>
                        <th className="py-4 px-6">Patient Reference</th>
                        <th className="py-4 px-6">Risk Profile</th>
                        <th className="py-4 px-6 font-mono">Uploader UID</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {filteredDocs.map((doc) => {
                        const risk = doc.summary?.risk_level?.toUpperCase() || "LOW";
                        const isHigh = risk.includes("HIGH");
                        const isMed = risk.includes("MEDIUM");

                        return (
                          <tr key={doc.id} className="hover:bg-slate-900/10 transition-colors text-sm">
                            <td className="py-4.5 px-6 font-bold text-slate-100">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-400" />
                                <span className="truncate max-w-[200px] sm:max-w-xs">{doc.filename}</span>
                              </div>
                            </td>
                            <td className="py-4.5 px-6 text-slate-400 font-medium">
                              {new Date(doc.uploaded_at).toLocaleDateString()}
                            </td>
                            <td className="py-4.5 px-6 text-slate-700 truncate max-w-[150px] font-medium">
                              {doc.summary?.patient_info || "Unspecified"}
                            </td>
                            <td className="py-4.5 px-6">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${
                                isHigh
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : isMed
                                  ? "bg-yellow-500/10 text-yellow-450 border-yellow-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
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
                            <td className="py-4.5 px-6 text-slate-500 text-xs font-mono truncate max-w-[100px]">{doc.user_id}</td>
                            <td className="py-4.5 px-6 text-right flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => router.push(`/dashboard/documents/detail?id=${doc.id}`)}
                                className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-955 text-slate-400 hover:text-white transition-all cursor-pointer"
                                title="View summary & chat"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => setDocToDelete(doc)}
                                className="p-2 rounded-lg border border-slate-800 hover:border-red-500/30 bg-slate-955 text-slate-500 hover:text-red-400 transition-all cursor-pointer disabled:opacity-55"
                                title="Purge database elements"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: DOCTORS */}
        {activeTab === "doctors" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter / Actions Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/20 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Doctors Management
              </h2>
              <button
                onClick={() => {
                  setDoctorToEdit(null);
                  setDoctorForm({
                    name: "",
                    qualification: "",
                    specialization: "",
                    experience: "",
                    hospital: "",
                    city: "",
                    contact_number: "",
                    email: "",
                    consultation_fee: 0,
                    about_doctor: ""
                  });
                  setShowAddDoctorModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-650/20 flex items-center gap-1.5"
              >
                Add New Doctor
              </button>
            </div>

            {/* Doctors Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0A4E7A] flex items-center gap-2">
                  Registered Doctors
                </h3>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {loadingDoctors ? "Loading..." : `${doctors.length} doctors total`}
                </span>
              </div>

              {loadingDoctors && doctors.length === 0 ? (
                <div className="py-24 text-center">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">Querying database...</p>
                </div>
              ) : doctors.length === 0 ? (
                <div className="py-24 text-center">
                  <UserCheck className="h-14 w-14 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">No doctors added yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-550 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Specialization</th>
                        <th className="py-4 px-6">Hospital</th>
                        <th className="py-4 px-6">Consultation Fee</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {doctors.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-900/10 transition-colors text-sm">
                          <td className="py-4.5 px-6 font-bold text-slate-100">
                            <div>
                              <p>{doc.name}</p>
                              <p className="text-[10px] text-slate-500 font-normal">{doc.qualification}</p>
                            </div>
                          </td>
                          <td className="py-4.5 px-6 text-indigo-400 font-semibold">{doc.specialization}</td>
                          <td className="py-4.5 px-6 text-slate-400 font-medium">
                            <div>
                              <p>{doc.hospital}</p>
                              <p className="text-[10px] text-slate-500 font-normal">{doc.city}</p>
                            </div>
                          </td>
                          <td className="py-4.5 px-6 text-emerald-400 font-bold">${doc.consultation_fee}</td>
                          <td className="py-4.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setDoctorToEdit(doc);
                                  setDoctorForm({
                                    name: doc.name,
                                    qualification: doc.qualification,
                                    specialization: doc.specialization,
                                    experience: doc.experience,
                                    hospital: doc.hospital,
                                    city: doc.city,
                                    contact_number: doc.contact_number,
                                    email: doc.email,
                                    consultation_fee: doc.consultation_fee,
                                    about_doctor: doc.about_doctor
                                  });
                                  setShowAddDoctorModal(true);
                                }}
                                className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-white transition-all cursor-pointer"
                                title="Edit Doctor Profile"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => handleDeleteDoctor(doc.id)}
                                className="p-2 rounded-lg border border-slate-800 hover:border-red-500/30 bg-slate-955 text-slate-550 hover:text-red-400 transition-all cursor-pointer disabled:opacity-55"
                                title="Delete Doctor Profile"
                              >
                                {actionLoading === `delete-doctor-${doc.id}` ? (
                                  <Loader2 className="h-3.5 w-3.5 text-red-400 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="space-y-6 animate-fade-in text-slate-100">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <h2 className="text-base font-bold text-[#0A4E7A] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#009F93]" /> Booked Appointments
              </h2>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {loadingAppointments ? "Loading..." : `${appointments.length} total appointments`}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0A4E7A] flex items-center gap-2">
                  Patient Reservations
                </h3>
              </div>

              {loadingAppointments && appointments.length === 0 ? (
                <div className="py-24 text-center">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">Querying appointments database...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="py-24 text-center">
                  <Calendar className="h-14 w-14 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">No patient appointments found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-550 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Patient</th>
                        <th className="py-4 px-6">Department & Doctor</th>
                        <th className="py-4 px-6">Scheduled Time</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Symptoms/Notes</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-sm">
                      {appointments.map((app) => {
                        const isPending = app.status === "pending";
                        const isConfirmed = app.status === "confirmed";
                        const isCompleted = app.status === "completed";
                        const isLoading = actionLoading === `update-appointment-${app.id}`;
                        const isDeleting = actionLoading === `delete-appointment-${app.id}`;

                        return (
                          <tr key={app.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-4.5 px-6 font-bold text-slate-800">
                              <div>
                                <p>{app.name}</p>
                                <p className="text-xs text-slate-500 font-normal font-mono">{app.email}</p>
                                <p className="text-xs text-slate-550 font-normal">{app.phone}</p>
                              </div>
                            </td>
                            <td className="py-4.5 px-6 font-medium text-slate-700">
                              <div>
                                <p className="text-indigo-500 font-semibold">{app.department?.toUpperCase()}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{app.doctor}</p>
                              </div>
                            </td>
                            <td className="py-4.5 px-6 text-slate-800 font-semibold">
                              <div>
                                <p>{new Date(app.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{app.time}</p>
                              </div>
                            </td>
                            <td className="py-4.5 px-6">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border text-[10px] uppercase ${
                                isConfirmed
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : isCompleted
                                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                  : "bg-yellow-500/10 text-yellow-450 border-yellow-500/20"
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-4.5 px-6 text-slate-400 text-xs max-w-[180px] truncate" title={app.notes}>
                              {app.notes || "None"}
                            </td>
                            <td className="py-4.5 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isPending && (
                                  <button
                                    disabled={isLoading}
                                    onClick={() => handleUpdateAppointmentStatus(app.id, "confirmed")}
                                    className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                                  >
                                    Confirm
                                  </button>
                                )}
                                {isConfirmed && (
                                  <button
                                    disabled={isLoading}
                                    onClick={() => handleUpdateAppointmentStatus(app.id, "completed")}
                                    className="px-2.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                                  >
                                    Complete
                                  </button>
                                )}
                                <button
                                  disabled={isDeleting || isLoading}
                                  onClick={() => handleDeleteAppointment(app.id)}
                                  className="p-2 rounded-lg border border-slate-800 hover:border-red-500/30 bg-slate-955 text-slate-500 hover:text-red-400 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="h-3.5 w-3.5 text-red-450 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: DELETE USER CONFIRMATION */}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
              <button
                onClick={() => setUserToDelete(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <AlertTriangle className="h-7 w-7 text-red-500 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Delete User Account?</h3>
              </div>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Are you sure you want to permanently delete user <strong className="text-slate-200">{userToDelete.name}</strong> (<span className="font-mono text-xs text-slate-300">{userToDelete.email}</span>)?
                <br /><br />
                This action is <strong className="text-red-500">permanent and destructive</strong>. It will remove:
                <span className="block mt-2 ml-4 list-disc text-slate-400 text-xs">
                  • Their login record from Firebase Authentication<br />
                  • Their user account profile from Firestore<br />
                  • All clinical documents uploaded by this user from Firestore<br />
                  • All indexed vector embeddings from the Qdrant database<br />
                  • All related clinical chat histories
                </span>
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-955 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete.uid)}
                  disabled={actionLoading === `delete-user-${userToDelete.uid}`}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-650 hover:bg-red-550 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-red-650/20"
                >
                  {actionLoading === `delete-user-${userToDelete.uid}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DELETE DOCUMENT CONFIRMATION */}
        {docToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
              <button
                onClick={() => setDocToDelete(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <AlertTriangle className="h-7 w-7 text-red-500" />
                <h3 className="text-lg font-bold text-white">Purge Clinical Report?</h3>
              </div>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Are you sure you want to delete <strong className="text-slate-200">{docToDelete.filename}</strong>?
                <br /><br />
                This will delete the summary metadata from Firestore database, wipe out its vector structures from the Qdrant instance, and close all chat threads associated with this report.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDocToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-955 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDoc(docToDelete.id)}
                  disabled={actionLoading === `delete-doc-${docToDelete.id}`}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-650 hover:bg-red-550 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-red-650/20"
                >
                  {actionLoading === `delete-doc-${docToDelete.id}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Purge Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD DOCTOR */}
        {showAddDoctorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative my-8">
              <button
                onClick={handleCloseDoctorModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-lg font-bold text-white mb-4 font-bold">{doctorToEdit ? "Edit Doctor Profile" : "Add Doctor Profile"}</h3>
              
              <form onSubmit={doctorToEdit ? handleUpdateDoctor : handleCreateDoctor} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Doctor's Name *</label>
                    <input
                      type="text"
                      required
                      value={doctorForm.name}
                      onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                      placeholder="e.g. Dr. Sarah Jenkins"
                      className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Qualification *</label>
                    <input
                      type="text"
                      required
                      value={doctorForm.qualification}
                      onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                      placeholder="e.g. MD, DM (Endocrinology)"
                      className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Specialization *</label>
                    <select
                      required
                      value={doctorForm.specialization}
                      onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">Select Specialty</option>
                      <option value="Endocrinologist">Endocrinologist</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="General Physician">General Physician</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Pulmonologist">Pulmonologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                      <option value="Oncologist">Oncologist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Experience *</label>
                    <input
                      type="text"
                      required
                      value={doctorForm.experience}
                      onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                      placeholder="e.g. 12 years"
                      className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Hospital *</label>
                    <input
                      type="text"
                      required
                      value={doctorForm.hospital}
                      onChange={(e) => setDoctorForm({ ...doctorForm, hospital: e.target.value })}
                      placeholder="e.g. Metro Clinical Center"
                      className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={doctorForm.city}
                      onChange={(e) => setDoctorForm({ ...doctorForm, city: e.target.value })}
                      placeholder="e.g. New York"
                      className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Contact Number *</label>
                    <input
                      type="text"
                      required
                      value={doctorForm.contact_number}
                      onChange={(e) => setDoctorForm({ ...doctorForm, contact_number: e.target.value })}
                      placeholder="e.g. +1-555-0192"
                      className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={doctorForm.email}
                      onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                      placeholder="e.g. dr.jenkins@metro.com"
                      className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Consultation Fee ($) *</label>
                  <input
                    type="number"
                    required
                    value={doctorForm.consultation_fee || ""}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 150"
                    className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">About Doctor *</label>
                  <textarea
                    required
                    rows={3}
                    value={doctorForm.about_doctor}
                    onChange={(e) => setDoctorForm({ ...doctorForm, about_doctor: e.target.value })}
                    placeholder="Brief description of the doctor's experience and clinical focus..."
                    className="w-full px-3.5 py-2 border border-slate-800 bg-slate-955 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={handleCloseDoctorModal}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-955 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === "create-doctor" || (actionLoading !== null && actionLoading.startsWith("update-doctor-"))}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-650/20"
                  >
                    {(actionLoading === "create-doctor" || (actionLoading !== null && actionLoading.startsWith("update-doctor-"))) && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {doctorToEdit ? "Update Doctor" : "Save Doctor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
