"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Activity, 
  Brain, 
  FileText, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Heart, 
  Stethoscope, 
  ChevronRight, 
  Check, 
  MapPin, 
  AlertCircle 
} from "lucide-react";
import SriHospitalLogo from "@/components/ui/SriHospitalLogo";
import { getApiUrl } from "@/lib/utils";

// Doctor data
const DEPARTMENTS = [
  { id: "cardiology", name: "Cardiology", doctors: ["Dr. Sri Deekshitha (MD, Chief Cardiologist)"] },
  { id: "neurology", name: "Neurology", doctors: ["Dr. Sarah Jenkins (MD, Senior Neurologist)"] },
  { id: "pediatrics", name: "Pediatrics", doctors: ["Dr. Elena Rostova (MD, Pediatric Chief)"] },
  { id: "orthopedics", name: "Orthopedics", doctors: ["Dr. Robert Vance (MD, Orthopedic Specialist)"] },
  { id: "emergency", name: "Emergency & Trauma", doctors: ["Dr. Marcus Vance (MD, Emergency Chief)"] },
  { id: "informatics", name: "Clinical Informatics / AI", doctors: ["Dr. Eswar Venkat (MD, MS, Informatics Director)"] }
];

export default function Home() {
  const { user } = useAuth();

  // Booking Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    doctor: "",
    date: "",
    time: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeDept = DEPARTMENTS.find(d => d.id === formData.department);
  const doctorOptions = activeDept ? activeDept.doctors : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "department" ? { doctor: "" } : {}) // Reset doctor if department changes
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/appointment/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to book appointment. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to submit booking. Check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      doctor: "",
      date: "",
      time: "",
      notes: ""
    });
    setIsSubmitted(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FA] text-slate-800 relative overflow-hidden">
      {/* Background Soft Natural Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#009F93]/3 blur-[140px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0A4E7A]/3 blur-[140px] -z-10" />

      {/* Top micro-info bar for true clinical portal design */}
      <div className="bg-[#0A4E7A] text-white text-[11px] py-2 px-4 sm:px-6 lg:px-8 border-b border-[#0A4E7A]/20 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#009F93]" /> Sector 6, Healthcare Avenue
            </span>
            <span className="hidden md:inline-block">|</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#009F93]" /> OPD Hours: 09:00 AM – 06:00 PM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold">
              <Phone className="h-3 w-3 text-[#009F93] animate-pulse" /> Emergency Desk: 1-800-SRI-HOSP
            </span>
          </div>
        </div>
      </div>

      {/* Header / Navbar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <SriHospitalLogo size={42} showTagline={true} />
          </Link>
          
          {/* Main Navigation links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-semibold text-slate-600 hover:text-indigo-500 transition-colors">
              Our Services
            </a>
            <a href="#patient-portal" className="text-sm font-semibold text-slate-600 hover:text-indigo-500 transition-colors">
              Online Patient Portal
            </a>
            <a href="#doctors" className="text-sm font-semibold text-slate-600 hover:text-indigo-500 transition-colors">
              Our Specialists
            </a>
            <a href="#appointment" className="text-sm font-semibold text-slate-600 hover:text-indigo-500 transition-colors">
              Book Appointment
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 text-sm font-bold transition-all shadow-md flex items-center gap-2"
              >
                Go to Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-600 hover:text-indigo-500 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20 text-sm font-bold transition-all hover:scale-[1.02]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* 1. Re-designed Hero Section: Natural and Welcoming (2 Columns) */}
        <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Warm Greeting & Text */}
            <div className="lg:col-span-7 text-left space-y-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-cyan-500/10 text-[#009F93] border border-cyan-500/20">
                <Heart className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span>Dedicated to Healing & Compassion</span>
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-indigo-500 leading-[1.12]">
                Your Health. <br />
                <span className="text-[#009F93]">Our Sacred Trust.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl">
                Welcome to Sri Hospital. We combine leading-edge medical equipment with deep personal attention to support your recovery. Our clinical teams provide compassionate medicine, diagnostic support, and a peaceful healing space for you and your loved ones.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:max-w-md pt-2">
                <a
                  href="#appointment"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 font-bold text-white transition-all shadow-md shadow-indigo-500/15 hover:scale-[1.01]"
                >
                  Book Appointment
                  <Calendar className="h-4.5 w-4.5" />
                </a>
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-bold text-[#0A4E7A] transition-all shadow-sm"
                >
                  Patient Portal
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Premium Stethoscope & Health Logo Illustration */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-white border border-slate-200 p-8 shadow-xl flex items-center justify-center hover:scale-[1.01] transition-all duration-300">
                {/* Subtle natural backgrounds */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/2 to-cyan-500/2 pointer-events-none" />
                <img
                  src="/hero-illustration.png"
                  alt="Sri Hospital Stethoscope and Heart Care Illustration"
                  className="w-full h-full object-contain select-none max-h-[320px]"
                />
              </div>
            </div>

          </div>
        </section>


        {/* 2. Medical Services / Departments */}
        <section id="services" className="py-24 bg-white border-y border-[rgba(10,78,122,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-[#009F93]">Clinical Excellence</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0A4E7A] mt-2">Our Specialty Clinics</h2>
              <p className="text-slate-500 max-w-xl mx-auto mt-4 text-sm sm:text-base">
                Our hospital is equipped with state-of-the-art facilities and staffed by experienced physicians to care for all clinical needs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="p-8 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.06)] hover:shadow-md transition-all group">
                <div className="h-12 w-12 rounded-xl bg-[#C8634A]/10 text-[#C8634A] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#0A4E7A]">Cardiology Department</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Comprehensive cardiovascular care, diagnostic ECG testing, bypass surgeries, and heart health prevention clinics.
                </p>
                <span className="text-xs font-bold text-[#009F93] block">OPD: Mon - Sat (9 AM - 5 PM)</span>
              </div>

              {/* Service 2 */}
              <div className="p-8 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.06)] hover:shadow-md transition-all group">
                <div className="h-12 w-12 rounded-xl bg-[#009F93]/10 text-[#009F93] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#0A4E7A]">Neurology Division</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Advanced treatment for spine conditions, nerve disorders, surgical brain solutions, and rehabilitation.
                </p>
                <span className="text-xs font-bold text-[#009F93] block">OPD: Mon - Fri (10 AM - 4 PM)</span>
              </div>

              {/* Service 3 */}
              <div className="p-8 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.06)] hover:shadow-md transition-all group">
                <div className="h-12 w-12 rounded-xl bg-[#0A4E7A]/10 text-[#0A4E7A] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#0A4E7A]">Pediatric & Neonatology</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Care tailored for infants and children, developmental tracking, vaccinations, and specialized newborn NICUs.
                </p>
                <span className="text-xs font-bold text-[#009F93] block">OPD: Mon - Sun (24 Hours Open)</span>
              </div>

              {/* Service 4 */}
              <div className="p-8 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.06)] hover:shadow-md transition-all group">
                <div className="h-12 w-12 rounded-xl bg-[#009F93]/10 text-[#009F93] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#0A4E7A]">Orthopedic & Joints</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Correction for joint replacements, complex fractures, sports injuries, physiotherapy, and bone strengthening therapies.
                </p>
                <span className="text-xs font-bold text-[#009F93] block">OPD: Mon - Sat (9 AM - 6 PM)</span>
              </div>

              {/* Service 5 */}
              <div className="p-8 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.06)] hover:shadow-md transition-all group">
                <div className="h-12 w-12 rounded-xl bg-[#C8634A]/10 text-[#C8634A] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#0A4E7A]">Trauma & Emergency</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Round-the-clock emergency team, direct ambulance coordination, and state-of-the-art life-support setups.
                </p>
                <span className="text-xs font-bold text-[#C8634A] block">24 Hours Emergency Intake</span>
              </div>

              {/* Service 6 */}
              <div className="p-8 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.06)] hover:shadow-md transition-all group">
                <div className="h-12 w-12 rounded-xl bg-[#0A4E7A]/10 text-[#0A4E7A] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#0A4E7A]">Oncology Center</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Comprehensive therapies, targeted chemotherapy protocols, cancer screening, and palliative care support.
                </p>
                <span className="text-xs font-bold text-[#009F93] block">OPD: Mon - Fri (10 AM - 5 PM)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Rebranded Patient Portal (No tech jargon, simple human terms) */}
        <section id="patient-portal" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text description */}
            <div className="space-y-8 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#009F93]/10 text-[#009F93] border border-[#009F93]/20">
                <Sparkles className="h-3 w-3" /> Secure Online Patient Care
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0A4E7A] tracking-tight leading-tight">
                Sri Digital Patient Portal
              </h2>
              <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
                Check lab reports, retrieve easy-to-understand explanations of diagnostics, and direct clinical questions to our medical administration desk. Log in securely from home.
              </p>

              {/* Portal Features list - Natural clinical benefits */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#009F93]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-[#009F93]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0A4E7A]">Secure Records Vault</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Access lab scan summaries, blood test histories, and physician prescriptions confidentially.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#009F93]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4.5 w-4.5 text-[#009F93]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0A4E7A]">Simplified Report Summaries</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Avoid medical jargon confusion. The portal translates complex lab numbers and findings into plain terms.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#009F93]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4.5 w-4.5 text-[#009F93]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0A4E7A]">Direct Medical Support Desk</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Inquire about report parameters, request drug explanations, or clarify values with the clinical team.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0A4E7A] text-white hover:bg-[#0D6197] font-bold shadow-md transition-all text-sm"
                >
                  Create Portal Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Visual Dashboard Mockup Grid - Natural colors, no neon */}
            <div className="p-2 rounded-2xl border border-[rgba(10,78,122,0.08)] bg-white shadow-md relative">
              <div className="relative rounded-xl border border-[rgba(10,78,122,0.1)] bg-[#F8F9FA] overflow-hidden shadow-inner">
                <div className="border-b border-slate-100 bg-white px-4 py-3.5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="text-[10px] font-bold tracking-wider text-[#0A4E7A] bg-[#0A4E7A]/5 px-3 py-1 rounded">
                    SRI PATIENT PORTAL
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Analysis card mock */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-[9px] text-[#009F93] font-bold tracking-wider uppercase">LAB SCAN REPORT</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-5 w-5 text-[#0A4E7A]" />
                        <span className="text-sm font-bold text-[#0A4E7A]">blood_metrics_july.pdf</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#009F93]/10 text-[#009F93]">Verified</span>
                    </div>
                  </div>

                  {/* Summary list mock */}
                  <div className="space-y-3">
                    <p className="text-[9px] text-slate-405 font-bold tracking-wider uppercase">PATIENT EXPLANATION</p>
                    <div className="p-3 rounded-lg border border-slate-200 text-xs text-slate-650 bg-white shadow-sm flex items-start gap-2.5">
                      <CheckCircle2 className="h-4.5 w-4.5 text-[#009F93] shrink-0 mt-0.5" />
                      <span><strong>Heart Rate:</strong> Recorded at 72 bpm, which is in the optimal target resting range for your age.</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 text-xs text-slate-655 bg-white shadow-sm flex items-start gap-2.5">
                      <CheckCircle2 className="h-4.5 w-4.5 text-[#009F93] shrink-0 mt-0.5" />
                      <span><strong>Cholesterol Metrics:</strong> Lipid levels show slight elevation. Recommended dietary reviews.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Meet Our Specialist Doctors */}
        <section id="doctors" className="py-24 bg-white border-y border-[rgba(10,78,122,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-[#009F93]">Renowned Experts</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0A4E7A] mt-2">Our Specialist Physicians</h2>
              <p className="text-slate-500 max-w-xl mx-auto mt-4 text-sm sm:text-base">
                Consult with our experienced specialist clinicians, committed to patient-first medical treatment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Doctor 1 */}
              <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.05)] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#0A4E7A] to-[#009F93] p-0.5 flex items-center justify-center mb-4">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center font-bold text-2xl text-[#0A4E7A]">
                    SD
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#0A4E7A]">Dr. Sri Deekshitha</h3>
                <p className="text-xs text-[#009F93] font-bold mt-1 uppercase tracking-wider">Chief Cardiologist</p>
                <p className="text-xs text-slate-500 mt-2">MD, FACC - 15+ years experience in interventional cardiology.</p>
                <a
                  href="#appointment"
                  onClick={() => setFormData(prev => ({ ...prev, department: "cardiology", doctor: "Dr. Sri Deekshitha (MD, Chief Cardiologist)" }))}
                  className="mt-5 text-xs font-bold text-[#0A4E7A] hover:text-[#009F93] transition-colors inline-flex items-center gap-1"
                >
                  Book Consultation <ChevronRight className="h-3 w-3" />
                </a>
              </div>

              {/* Doctor 2 */}
              <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.05)] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#0A4E7A] to-[#009F93] p-0.5 flex items-center justify-center mb-4">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center font-bold text-2xl text-[#0A4E7A]">
                    EV
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#0A4E7A]">Dr. Eswar Venkat</h3>
                <p className="text-xs text-[#009F93] font-bold mt-1 uppercase tracking-wider">Informatics Director</p>
                <p className="text-xs text-slate-500 mt-2">MD, MS (Stanford) - Specializes in clinical health analytics and EHR systems.</p>
                <a
                  href="#appointment"
                  onClick={() => setFormData(prev => ({ ...prev, department: "informatics", doctor: "Dr. Eswar Venkat (MD, MS, Informatics Director)" }))}
                  className="mt-5 text-xs font-bold text-[#0A4E7A] hover:text-[#009F93] transition-colors inline-flex items-center gap-1"
                >
                  Book Consultation <ChevronRight className="h-3 w-3" />
                </a>
              </div>

              {/* Doctor 3 */}
              <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.05)] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#0A4E7A] to-[#009F93] p-0.5 flex items-center justify-center mb-4">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center font-bold text-2xl text-[#0A4E7A]">
                    SJ
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#0A4E7A]">Dr. Sarah Jenkins</h3>
                <p className="text-xs text-[#009F93] font-bold mt-1 uppercase tracking-wider">Senior Neurologist</p>
                <p className="text-xs text-slate-500 mt-2">MD, PhD - Leading specialist in neurological diagnostic research and stroke care.</p>
                <a
                  href="#appointment"
                  onClick={() => setFormData(prev => ({ ...prev, department: "neurology", doctor: "Dr. Sarah Jenkins (MD, Senior Neurologist)" }))}
                  className="mt-5 text-xs font-bold text-[#0A4E7A] hover:text-[#009F93] transition-colors inline-flex items-center gap-1"
                >
                  Book Consultation <ChevronRight className="h-3 w-3" />
                </a>
              </div>

              {/* Doctor 4 */}
              <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[rgba(10,78,122,0.05)] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#0A4E7A] to-[#009F93] p-0.5 flex items-center justify-center mb-4">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center font-bold text-2xl text-[#0A4E7A]">
                    MV
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#0A4E7A]">Dr. Marcus Vance</h3>
                <p className="text-xs text-[#009F93] font-bold mt-1 uppercase tracking-wider">Emergency Chief</p>
                <p className="text-xs text-slate-500 mt-2">MD - Board-certified in critical emergency medicine and acute trauma response.</p>
                <a
                  href="#appointment"
                  onClick={() => setFormData(prev => ({ ...prev, department: "emergency", doctor: "Dr. Marcus Vance (MD, Emergency Chief)" }))}
                  className="mt-5 text-xs font-bold text-[#0A4E7A] hover:text-[#009F93] transition-colors inline-flex items-center gap-1"
                >
                  Book Consultation <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Appointment Booking Form Section */}
        <section id="appointment" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-10">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C8634A]">Schedule Consultation</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A4E7A] mt-2">Book Your Appointment</h2>
            <p className="text-slate-500 mt-3 text-sm">
              Please enter patient details and select a slot. Our clinical coordinator team will reach out to confirm your booking within 1 hour.
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[rgba(10,78,122,0.08)] shadow-xl relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#009F93]/3 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C8634A]/3 rounded-full blur-2xl pointer-events-none" />

            {!isSubmitted ? (
              <form onSubmit={handleBookingSubmit} className="space-y-6 relative text-left">
                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient Full Name *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-455">
                        <UserIcon className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[rgba(10,78,122,0.1)] rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Phone number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Phone *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-455">
                        <Phone className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[rgba(10,78,122,0.1)] rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-455">
                        <Mail className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[rgba(10,78,122,0.1)] rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Select Department */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Department *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-455">
                        <Stethoscope className="h-4.5 w-4.5" />
                      </span>
                      <select
                        name="department"
                        required
                        value={formData.department}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[rgba(10,78,122,0.1)] rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm appearance-none cursor-pointer"
                      >
                        <option value="">Choose department...</option>
                        {DEPARTMENTS.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Select Doctor */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Specialist Doctor *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-455">
                        <UserIcon className="h-4.5 w-4.5" />
                      </span>
                      <select
                        name="doctor"
                        required
                        value={formData.doctor}
                        onChange={handleInputChange}
                        disabled={!formData.department}
                        className="block w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[rgba(10,78,122,0.1)] rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm appearance-none disabled:opacity-50 cursor-pointer"
                      >
                        <option value="">{formData.department ? "Choose doctor..." : "Select department first"}</option>
                        {doctorOptions.map((doc, idx) => (
                          <option key={idx} value={doc}>{doc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Appointment Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Date *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-455">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <input
                          type="date"
                          name="date"
                          required
                          value={formData.date}
                          onChange={handleInputChange}
                          className="block w-full pl-9 pr-2 py-3 bg-[#F8F9FA] border border-[rgba(10,78,122,0.1)] rounded-xl text-slate-850 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Slot *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-455">
                          <Clock className="h-4 w-4" />
                        </span>
                        <select
                          name="time"
                          required
                          value={formData.time}
                          onChange={handleInputChange}
                          className="block w-full pl-9 pr-2 py-3 bg-[#F8F9FA] border border-[rgba(10,78,122,0.1)] rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm appearance-none cursor-pointer"
                        >
                          <option value="">Time...</option>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="03:30 PM">03:30 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medical History Notes / Symptoms</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-4 py-3 bg-[#F8F9FA] border border-[rgba(10,78,122,0.1)] rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A4E7A] focus:border-transparent text-sm"
                    placeholder="Briefly state symptoms, clinical history, or medical concerns..."
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-[#0A4E7A] to-[#009F93] hover:from-[#0D6197] hover:to-[#008076] font-bold text-white shadow-md shadow-[#0A4E7A]/20 transition-all text-sm hover:scale-[1.01] disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing Request..." : "Submit Appointment Request"}
                  </button>
                </div>
              </form>
            ) : (
              // Success confirmation state
              <div className="flex flex-col items-center text-center py-8 animate-fade-in text-slate-800">
                <div className="h-16 w-16 rounded-full bg-[#009F93]/10 border border-[#009F93]/20 flex items-center justify-center mb-6">
                  <Check className="h-8 w-8 text-[#009F93]" />
                </div>
                <h3 className="text-2xl font-black text-[#0A4E7A]">Appointment Request Received!</h3>
                <p className="text-slate-655 mt-3 max-w-md text-sm leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. We have registered your reservation with <strong>{formData.doctor}</strong> for <strong>{formData.date}</strong> at <strong>{formData.time}</strong>.
                </p>
                <div className="p-4 rounded-xl border border-slate-200 bg-[#F8F9FA] w-full max-w-sm mt-6 text-xs text-slate-500 text-left space-y-1.5 shadow-inner">
                  <p>• <strong>Department:</strong> {activeDept?.name}</p>
                  <p>• <strong>Contact Email:</strong> {formData.email}</p>
                  <p>• <strong>Status:</strong> Awaiting coordinator validation check</p>
                </div>
                <button
                  onClick={resetForm}
                  className="mt-8 px-6 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 transition-all"
                >
                  Book Another Appointment
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(10,78,122,0.08)] py-16 bg-white text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          {/* Brand col */}
          <div className="space-y-4 md:col-span-2">
            <SriHospitalLogo size={36} showTagline={true} />
            <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
              Serving the community with state-of-the-art clinical facilities and dedicated personal medicine.
            </p>
            <p className="text-[10px] text-slate-400 mt-4">
              © {new Date().getFullYear()} Sri Hospital. All rights reserved.
            </p>
          </div>

          {/* Quick Info col */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A4E7A]">Location & Hours</h4>
            <div className="space-y-2.5 text-slate-500">
              <p className="flex items-start gap-2">
                <MapPin className="h-4.5 w-4.5 text-[#009F93] shrink-0 mt-0.5" />
                <span>Sri Hospital Buildings,<br />12/4 Healthcare Avenue,<br />Main Road Sector 6</span>
              </p>
              <p className="mt-2 font-semibold">
                OPD: 09:00 AM – 06:00 PM
              </p>
            </div>
          </div>

          {/* Emergency Contact col */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C8634A]">24/7 Hotline</h4>
            <div className="space-y-2 text-slate-500">
              <p className="flex items-center gap-2 font-bold text-[#C8634A] text-sm">
                <Phone className="h-4.5 w-4.5 animate-bounce shrink-0" />
                <span>1-800-SRI-HOSP</span>
              </p>
              <p className="text-slate-400 leading-relaxed mt-3">
                Disclaimer: The Online Patient Portal is designed to provide reference clinical insights only. Please contact emergency services or consult a physician for diagnostic decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Authors attribution credits banner */}
        <div className="border-t border-slate-100 max-w-7xl mx-auto mt-12 pt-6 text-center text-[10px] text-slate-405 font-medium">
          developed by <span className="text-[#0A4E7A] font-bold">Sri deekshitha and Eswar venkat</span>
        </div>
      </footer>
    </div>
  );
}
