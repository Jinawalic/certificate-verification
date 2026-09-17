"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback, ChangeEvent, DragEvent } from "react";
import Link from "next/link";
import {
  FileText,
  FilePlus2,
  Search,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  ExternalLink,
  Menu,
  Award,
  Users,
  Calendar,
  Lock,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Copy,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Printer,
  Loader2,
  RefreshCw
} from "lucide-react";
import {
  Button,
  Input,
  StatsCard,
  Sidebar,
  AdminDashboardTab,
  UploadTemplateModal,
  PrintCertificateModal
} from "@/components/admin";
import { useRouter } from "next/navigation";
import {
  VerifiedCertificate
} from "@/lib/verification";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminDashboardTab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<VerifiedCertificate | null>(null);

  // Live registry state fetched from database
  const [certificates, setCertificates] = useState<VerifiedCertificate[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(true);
  const [isGeneratingCert, setIsGeneratingCert] = useState<string | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);
  const [stats, setStats] = useState({
    total: 0,
    issued: 0,
    verified: 0,
    pending: 0,
    verifiedToday: 0,
    totalPrinted: 0,
  });

  // Load students from database
  const fetchStudentsFromDb = useCallback(async () => {
    try {
      setIsLoadingStudents(true);
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setCertificates(data.students);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch students from DB:", err);
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  // Currently logged-in admin profile
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email?: string;
    role?: string;
    department?: string | null;
  } | null>(null);

  useEffect(() => {
    fetchStudentsFromDb();

    async function loadAdminUser() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.warn("Failed to load admin user profile:", err);
      }
    }
    loadAdminUser();
  }, [fetchStudentsFromDb]);

  // Search, Filter & Pagination state for table
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit & Delete modal states
  const [editingCert, setEditingCert] = useState<VerifiedCertificate | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<VerifiedCertificate>>({});
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingCert, setDeletingCert] = useState<VerifiedCertificate | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // State for QR preview modal
  const [previewCert, setPreviewCert] = useState<VerifiedCertificate | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // State for CSV student upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<VerifiedCertificate[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Template notification
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);

  // Filtered records
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        cert.fullName.toLowerCase().includes(q) ||
        (cert.certificateNumber ? cert.certificateNumber.toLowerCase().includes(q) : false) ||
        cert.matricNumber.toLowerCase().includes(q) ||
        cert.degreeAwarded.toLowerCase().includes(q);

      const matchesFaculty =
        facultyFilter === "All" || cert.faculty === facultyFilter;

      return matchesSearch && matchesFaculty;
    });
  }, [certificates, searchQuery, facultyFilter]);

  // Count pending certificates
  const pendingCertificatesCount = useMemo(() => {
    return certificates.filter((c) => !c.certificateNumber).length;
  }, [certificates]);

  // Distinct faculties for dropdown filter
  const facultiesList = useMemo(() => {
    const set = new Set(certificates.map((c) => c.faculty).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [certificates]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / pageSize));
  const paginatedCertificates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCertificates.slice(start, start + pageSize);
  }, [filteredCertificates, currentPage, pageSize]);

  // Generate certificate for a single student
  const handleGenerateSingleCertificate = async (cert: VerifiedCertificate) => {
    if (cert.certificateNumber) return;
    setIsGeneratingCert(cert.matricNumber);
    try {
      const res = await fetch("/api/admin/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: cert.id, matricNumber: cert.matricNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate certificate");
      }
      const generatedNum = data.certificates?.[0]?.certificateNumber;
      setTemplateNotice(
        `Official Certificate generated for ${cert.fullName}! Assigned Number: ${generatedNum}`
      );
      await fetchStudentsFromDb();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating certificate";
      setTemplateNotice(`Generation Error: ${msg}`);
    } finally {
      setIsGeneratingCert(null);
    }
  };

  // Batch generate certificates for all pending students
  const handleBatchGenerateCertificates = async () => {
    const pending = certificates.filter((c) => !c.certificateNumber);
    if (pending.length === 0) return;

    setIsBatchGenerating(true);
    try {
      const res = await fetch("/api/admin/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: pending.map((s) => s.id).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to batch generate certificates");
      }
      setTemplateNotice(
        `Successfully generated and registered official certificates for ${data.count} student(s)!`
      );
      await fetchStudentsFromDb();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating batch certificates";
      setTemplateNotice(`Batch Error: ${msg}`);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  // Edit record handlers
  const handleEditClick = (cert: VerifiedCertificate) => {
    setEditingCert(cert);
    setEditFormData({ ...cert });
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    try {
      setIsSavingEdit(true);
      setEditError(null);

      const res = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          id: editingCert.id,
          originalMatricNumber: editingCert.matricNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update student record.");
      }

      const updated = data.student as VerifiedCertificate;
      setCertificates((prev) =>
        prev.map((c) =>
          (c.id && updated.id && c.id === updated.id) ||
          c.matricNumber === editingCert.matricNumber
            ? { ...c, ...updated }
            : c
        )
      );

      setTemplateNotice(
        data.message || `Record for ${updated.fullName || editingCert.fullName} has been updated.`
      );
      setEditingCert(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving student record";
      setEditError(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete record handlers
  const handleDeleteClick = (cert: VerifiedCertificate) => {
    setDeletingCert(cert);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCert) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const url = deletingCert.id
        ? `/api/admin/students?id=${encodeURIComponent(deletingCert.id)}`
        : `/api/admin/students?matricNumber=${encodeURIComponent(deletingCert.matricNumber)}`;

      const res = await fetch(url, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete student record.");
      }

      setCertificates((prev) =>
        prev.filter((c) =>
          deletingCert.id && c.id
            ? c.id !== deletingCert.id
            : c.matricNumber !== deletingCert.matricNumber
        )
      );

      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        verified: deletingCert.status === "VERIFIED" ? Math.max(0, prev.verified - 1) : prev.verified,
        pending: deletingCert.status === "PENDING" ? Math.max(0, prev.pending - 1) : prev.pending,
      }));

      setTemplateNotice(
        data.message || `Record (${deletingCert.fullName}) removed from registry.`
      );
      setDeletingCert(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting student record";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Download Sample CSV helper - NO certificate number included!
  const handleDownloadSampleCSV = () => {
    const headers =
      "Full Name,Matric Number,Faculty,Department,Degree Awarded,Class of Degree,Graduation Year,Senate Approval Date\n";
    const sampleRows = [
      "Ibrahim Danladi Musa,NSUK/NAS/CSC/20/1042,Faculty of Natural & Applied Sciences,Department of Computer Science,Bachelor of Science (B.Sc.) in Computer Science,First Class Honours,2024,28th October 2024",
      "Fatima Aliyu Bello,NSUK/LAW/CIL/19/0312,Faculty of Law,Department of Common & Islamic Law,Bachelor of Laws (LL.B.),Second Class Honours (Upper Division),2024,28th October 2024",
      "Emmanuel Chukwudi Eze,NSUK/ADM/BUS/20/0541,Faculty of Administration & Business,Department of Business Administration,Bachelor of Science (B.Sc.) in Business Administration,Second Class Honours (Upper Division),2024,28th October 2024",
      "Zainab Abubakar Sadiq,NSUK/FAS/BCH/20/0819,Faculty of Natural & Applied Sciences,Department of Biochemistry,Bachelor of Science (B.Sc.) in Biochemistry,First Class Honours,2024,28th October 2024",
    ].join("\n");

    const blob = new Blob([headers + sampleRows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "nsuk_students_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV Drag & Drop handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCsvFile(e.target.files[0]);
    }
  };

  // Process CSV File (Without Certificate Number)
  const processCsvFile = (file: File) => {
    setCsvError(null);
    setImportSuccessCount(null);

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setCsvError("Please upload a valid CSV file (e.g. .csv format).");
      return;
    }

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text
          .split(/\r\n|\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (lines.length <= 1) {
          setCsvError("The uploaded CSV file does not contain any student rows.");
          return;
        }

        // Parse data rows (skipping header)
        const parsed: VerifiedCertificate[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
          if (parts.length >= 2) {
            const fullName = parts[0];
            const matricNumber = parts[1];
            const faculty = parts[2] || "Faculty of Natural & Applied Sciences";
            const department = parts[3] || "Department of Academic Registry";
            const degreeAwarded = parts[4] || "Bachelor of Science (B.Sc.)";
            const classOfDegree = parts[5] || "Second Class Honours (Upper Division)";
            const graduationYear = parts[6] || "2024";
            const senateApprovalDate = parts[7] || "28th October 2024";

            parsed.push({
              matricNumber,
              fullName,
              faculty,
              department,
              degreeAwarded,
              classOfDegree,
              graduationYear,
              senateApprovalDate,
              certificateNumber: null, // As specified: NO certificate number upon upload!
              status: "PENDING",
              cryptographicHash: null,
              qrSignature: null,
              dateOfIssue: null,
            });
          }
        }

        if (parsed.length === 0) {
          setCsvError("Could not extract valid student rows. Please use the downloadable sample CSV structure.");
        } else {
          setParsedStudents(parsed);
        }
      } catch (err) {
        setCsvError("Error parsing CSV file. Please verify file format.");
      }
    };
    reader.readAsText(file);
  };

  // Confirm Import via Real API
  const handleConfirmImport = async () => {
    if (!csvFile && parsedStudents.length === 0) return;

    setIsImporting(true);
    setCsvError(null);

    try {
      let res;
      if (csvFile) {
        const formData = new FormData();
        formData.append("file", csvFile);
        res = await fetch("/api/admin/students/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/admin/students/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: parsedStudents }),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload students to database");
      }

      const count = (data.insertedCount || 0) + (data.updatedCount || 0);
      setImportSuccessCount(count);
      setTemplateNotice(data.message || `Successfully registered ${count} students in database!`);
      setParsedStudents([]);
      setCsvFile(null);
      await fetchStudentsFromDb();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading CSV file";
      setCsvError(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Sign out error:", err);
    }
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900 selection:bg-emerald-800 selection:text-white">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        recordsCount={certificates.length}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 hover:text-emerald-900 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Registrar Verification Administration</span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Nasarawa State University, Keffi &bull; Senate Academic Records Division
              </p>
            </div>
          </div>

          {/* Top Actions: Print Certificate Button */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => {
                setSelectedPrintStudent(null);
                setIsPrintModalOpen(true);
              }}
            >
              Print Certificate
            </Button>
          </div>
        </header>

        {/* Dashboard Body Container */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Template Notice Banner if newly uploaded */}
          {templateNotice && (
            <div className="rounded-2xl border border-emerald-800/20 bg-emerald-50/80 p-4 shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>{templateNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setTemplateNotice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* VIEW SWITCHER TABS BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-white text-emerald-900 font-bold shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                <span>Dashboard Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("issue")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all cursor-pointer ${
                  activeTab === "issue"
                    ? "bg-white text-emerald-900 font-bold shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Upload Students (CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("records")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all cursor-pointer ${
                  activeTab === "records"
                    ? "bg-white text-emerald-900 font-bold shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Issued Records ({certificates.length})</span>
              </button>
            </div>

            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              Senate Session: 2023/2024
            </span>
          </div>

          {/* ======================================================== */}
          {/* VIEW 1: DASHBOARD OVERVIEW (METRICS CARDS ONLY APPEAR HERE) */}
          {/* ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Summary Metrics Section (ONLY VISIBLE ON DASHBOARD OVERVIEW) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                <StatsCard
                  title="Total Students"
                  value={stats.total ? stats.total.toLocaleString() : certificates.length.toLocaleString()}
                  icon={Users}
                />
                <StatsCard
                  title="Issued Certificates"
                  value={(stats.issued || certificates.filter((c) => Boolean(c.certificateNumber)).length).toLocaleString()}
                  icon={Award}
                />
                <StatsCard
                  title="Pending Issuance"
                  value={(stats.pending !== undefined ? stats.pending : certificates.filter((c) => !c.certificateNumber).length).toLocaleString()}
                  icon={Sparkles}
                />
                <StatsCard
                  title="Verified Today"
                  value={(stats.verifiedToday || 0).toLocaleString()}
                  icon={CheckCircle2}
                />
              </div>

              {/* Recent Summary & Action Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Issuance Batches */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Recent Senate Issuance Batches
                      </h3>
                      <p className="text-xs text-slate-500">
                        Authoritative graduation records verified by Senate Registry
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab("records")}
                    >
                      View All Records
                    </Button>
                  </div>

                    <div className="divide-y divide-slate-100">
                      {certificates.slice(0, 4).map((cert) => (
                        <div
                          key={cert.id || cert.matricNumber}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-mono text-xs font-bold ring-1 ring-emerald-800/15 shrink-0">
                              NSUK
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {cert.fullName}
                              </p>
                              <p className="text-xs text-slate-500">
                                <span className="font-mono text-emerald-800 font-semibold">
                                  {cert.certificateNumber || "Pending Issuance"}
                                </span>{" "}
                                &bull; {cert.degreeAwarded}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {cert.certificateNumber ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                Issued
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Pending
                              </span>
                            )}
                            {cert.certificateNumber && (
                              <button
                                type="button"
                                onClick={() => setPreviewCert(cert)}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="View QR Details"
                              >
                                <QrCode className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                {/* Quick Upload Action Panel */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Batch Import
                        </h3>
                        <p className="text-xs text-emerald-800 font-medium">
                          CSV Upload Available
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Quickly upload student cohorts via CSV format. Each imported student record is automatically cryptographically signed and issued a SHA-256 verifiable QR code.
                    </p>

                    <div className="mt-5 space-y-2.5">
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 text-xs flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Supported File</span>
                        <span className="font-mono text-emerald-900 font-bold">.CSV</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 text-xs flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Template Available</span>
                        <span className="text-emerald-800 font-bold">Yes (Downloadable)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <Button
                      variant="primary"
                      className="w-full"
                      leftIcon={<Upload className="h-4 w-4" />}
                      onClick={() => setActiveTab("issue")}
                    >
                      Upload Students in CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: UPLOAD STUDENTS (CSV FILE UPLOAD + SAMPLE CSV) */}
          {/* ======================================================== */}
          {activeTab === "issue" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
              {/* Success Alert after Import */}
              {importSuccessCount !== null && (
                <div className="rounded-2xl border border-emerald-800/20 bg-emerald-50 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Batch Import Successful!
                      </h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        <strong>{importSuccessCount} students</strong> have been registered, cryptographically sealed, and added to the official Senate registry.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    onClick={() => setActiveTab("records")}
                  >
                    View in Issued Records
                  </Button>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                {/* Header & Download Sample Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs shrink-0">
                      <FileSpreadsheet className="h-6 w-6 text-emerald-300" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        Upload Students via CSV
                      </h2>
                      <p className="text-xs text-slate-500">
                        Upload student cohort spreadsheet to register credentials in batch
                      </p>
                    </div>
                  </div>

                  {/* Download Sample CSV Action */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4 text-emerald-800" />}
                    onClick={handleDownloadSampleCSV}
                  >
                    Download Sample CSV
                  </Button>
                </div>

                {/* CSV Upload Dropzone */}
                <div className="mt-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  {!csvFile ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                        dragActive
                          ? "border-emerald-700 bg-emerald-50/70 scale-[0.99]"
                          : "border-slate-300 bg-slate-50/60 hover:border-emerald-700 hover:bg-emerald-50/30"
                      }`}
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-3 shadow-xs">
                        <Upload className="h-7 w-7" />
                      </div>

                      <h4 className="text-sm font-bold text-slate-800">
                        Click to browse or drag and drop students CSV file
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 max-w-sm">
                        Ensure your CSV matches the column headers provided in the downloadable sample CSV.
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Select CSV File</span>
                      </div>
                    </div>
                  ) : (
                    /* Selected CSV Info Card */
                    <div className="rounded-2xl border border-emerald-800/20 bg-emerald-50/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs shrink-0">
                            <FileSpreadsheet className="h-6 w-6 text-emerald-200" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{csvFile.name}</p>
                            <p className="text-xs text-slate-500">
                              {(csvFile.size / 1024).toFixed(1)} KB &bull;{" "}
                              {parsedStudents.length} student records identified
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCsvFile(null);
                            setParsedStudents([]);
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {csvError && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>{csvError}</span>
                    </div>
                  )}
                </div>

                {/* Parsed Students Preview Table */}
                {parsedStudents.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
                        Students Ready to Import ({parsedStudents.length})
                      </h3>
                      <span className="text-xs text-slate-500">
                        Review records before ratification
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            <th className="py-2.5 px-3">Full Name</th>
                            <th className="py-2.5 px-3">Matric #</th>
                            <th className="py-2.5 px-3">Faculty</th>
                            <th className="py-2.5 px-3">Programme</th>
                            <th className="py-2.5 px-3">Class</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedStudents.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                                <span title={s.fullName} className="block truncate max-w-[180px]">
                                  {s.fullName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                                <span title={s.matricNumber} className="block truncate max-w-[140px]">
                                  {s.matricNumber}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                                <span title={s.faculty} className="block truncate max-w-[160px]">
                                  {s.faculty}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                                <span title={s.degreeAwarded} className="block truncate max-w-[180px]">
                                  {s.degreeAwarded}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-emerald-800 font-medium whitespace-nowrap">
                                <span title={s.classOfDegree} className="block truncate max-w-[140px]">
                                  {s.classOfDegree}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Submit / Confirm Button */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setCsvFile(null);
                          setParsedStudents([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        isLoading={isImporting}
                        onClick={handleConfirmImport}
                        leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      >
                        Confirm & Register {parsedStudents.length} Students
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: ISSUED CERTIFICATES RECORDS TABLE */}
          {/* ======================================================== */}
          {activeTab === "records" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {/* Search & Filter Header */}
                <div className="border-b border-slate-200 p-4 sm:p-5 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Search className="h-4 w-4 text-emerald-800/60" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search by graduate name, cert #, matric #..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                    />
                  </div>

                  {/* Faculty Filter & Actions Header */}
                  <div className="flex flex-wrap items-center gap-2">
                    {pendingCertificatesCount > 0 && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        isLoading={isBatchGenerating}
                        onClick={handleBatchGenerateCertificates}
                        leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                        title="Generate official certificate numbers for all pending students"
                      >
                        Generate Pending ({pendingCertificatesCount})
                      </Button>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
                      <Filter className="h-3.5 w-3.5 text-emerald-800" />
                      <span>Faculty:</span>
                    </div>
                    <select
                      value={facultyFilter}
                      onChange={(e) => {
                        setFacultyFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 cursor-pointer"
                    >
                      {facultiesList.map((fac) => (
                        <option key={fac} value={fac}>
                          {fac}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={fetchStudentsFromDb}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                      title="Refresh from Database"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingStudents ? "animate-spin text-emerald-800" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Table matching user design exactly */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-[#f8fafc] text-xs font-bold uppercase tracking-wider text-slate-700">
                        <th className="py-4 px-4 sm:px-6">S/N</th>
                        <th className="py-4 px-4 sm:px-6">FULL NAME</th>
                        <th className="py-4 px-4 sm:px-6">MATRIC #</th>
                        <th className="py-4 px-4 sm:px-6">CERTIFICATE #</th>
                        <th className="py-4 px-4 sm:px-6">PROGRAMME</th>
                        <th className="py-4 px-4 sm:px-6">CLASS</th>
                        <th className="py-4 px-4 sm:px-6 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCertificates.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <FileText className="h-8 w-8 text-slate-300" />
                              <p className="font-semibold text-slate-700">
                                {isLoadingStudents ? "Loading records from database..." : "No certificate records match your search criteria."}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery("");
                                  setFacultyFilter("All");
                                  setCurrentPage(1);
                                }}
                                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                              >
                                Reset filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedCertificates.map((cert, index) => {
                          const serialNumber = (currentPage - 1) * pageSize + index + 1;
                          return (
                            <tr
                              key={cert.id || cert.matricNumber}
                              className="hover:bg-slate-50/70 transition-colors"
                            >
                              {/* S/N */}
                              <td className="py-4 px-4 sm:px-6 text-slate-500 font-medium text-xs sm:text-sm whitespace-nowrap">
                                {serialNumber}
                              </td>

                              {/* FULL NAME */}
                              <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                                <div title={cert.fullName} className="max-w-[240px]">
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap truncate block">
                                    {cert.fullName}
                                  </span>
                                </div>
                              </td>

                              {/* MATRIC # */}
                              <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                                <div title={cert.matricNumber} className="max-w-[170px]">
                                  <span className="text-slate-600 font-normal font-mono text-xs sm:text-[13px] whitespace-nowrap truncate block">
                                    {cert.matricNumber}
                                  </span>
                                </div>
                              </td>

                              {/* CERTIFICATE # */}
                              <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                                {cert.certificateNumber ? (
                                  <div title={cert.certificateNumber} className="max-w-[210px]">
                                    <span className="font-bold text-slate-900 font-mono text-xs sm:text-[13px] whitespace-nowrap truncate block">
                                      {cert.certificateNumber}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    Pending Issuance
                                  </span>
                                )}
                              </td>

                              {/* PROGRAMME */}
                              <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                                <div title={cert.degreeAwarded} className="max-w-[220px]">
                                  <span className="text-slate-600 text-xs sm:text-[13px] whitespace-nowrap truncate block">
                                    {cert.degreeAwarded}
                                  </span>
                                </div>
                              </td>

                              {/* CLASS */}
                              <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                                <div title={cert.classOfDegree} className="max-w-[190px]">
                                  <span className="text-emerald-800 font-semibold text-xs sm:text-[13px] whitespace-nowrap truncate block">
                                    {cert.classOfDegree}
                                  </span>
                                </div>
                              </td>

                              {/* ACTION */}
                              <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  {!cert.certificateNumber ? (
                                    <Button
                                      type="button"
                                      variant="primary"
                                      size="xs"
                                      isLoading={isGeneratingCert === cert.matricNumber}
                                      onClick={() => handleGenerateSingleCertificate(cert)}
                                      leftIcon={<Sparkles className="h-3 w-3" />}
                                      title="Generate official certificate number and cryptographic signature"
                                    >
                                      Generate
                                    </Button>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setPreviewCert(cert)}
                                        className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                                        title="View QR Seal & Details"
                                      >
                                        <QrCode className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedPrintStudent(cert);
                                          setIsPrintModalOpen(true);
                                        }}
                                        className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                                        title="Print Official Certificate"
                                      >
                                        <Printer className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleEditClick(cert)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                                    title="Edit Student Record"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClick(cert)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Bar */}
                <div className="border-t border-slate-200 p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-3">
                    <span>
                      Showing{" "}
                      <strong className="text-slate-900">
                        {filteredCertificates.length === 0
                          ? 0
                          : (currentPage - 1) * pageSize + 1}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-slate-900">
                        {Math.min(currentPage * pageSize, filteredCertificates.length)}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-slate-900">{filteredCertificates.length}</strong>{" "}
                      records
                    </span>

                    <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-3">
                      <span className="text-slate-400">Per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-semibold text-slate-800 focus:border-emerald-700 focus:outline-none cursor-pointer"
                      >
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  </div>

                  {/* Pagination Navigation */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 w-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === page
                              ? "bg-emerald-800 text-white shadow-xs"
                              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages || filteredCertificates.length === 0}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Upload Certificate Template Modal */}
      <UploadTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onTemplateApplied={(fileName) => {
          setTemplateNotice(`Template "${fileName}" successfully deployed to central printing and verification register.`);
        }}
      />

      {/* Print Official Certificate Modal */}
      <PrintCertificateModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedPrintStudent(null);
        }}
        students={certificates}
        initialStudent={selectedPrintStudent}
      />

      {/* QR & Security Record Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-900 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 ring-1 ring-emerald-700 text-white shadow-xs">
                  <QrCode className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Verifiable QR Certificate Seal</h3>
                  <p className="text-xs text-emerald-200/80">
                    Cryptographic SHA-256 Senate Payload
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-800/20 p-2 shadow-inner">
                  <QrCode className="h-20 w-20 text-emerald-900" />
                </div>
                <span className="mt-3 font-mono font-bold text-sm text-emerald-950">
                  {previewCert.certificateNumber}
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {previewCert.fullName}
                </p>
                <p className="text-[11px] text-slate-500">
                  {previewCert.degreeAwarded} &bull; {previewCert.classOfDegree}
                </p>
              </div>

              {/* Cryptographic SHA-256 Box */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    SHA-256 Digital Checksum
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(previewCert.cryptographicHash || "")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-[10px] text-slate-600 break-all leading-relaxed">
                  {previewCert.cryptographicHash || "Cryptographic hash will be generated upon certificate issuance."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPreviewCert(null)}
                >
                  Close
                </Button>
                {previewCert.certificateNumber && (
                  <Link
                    href={`/verify/${encodeURIComponent(
                      previewCert.certificateNumber.replace(/\//g, "-")
                    )}`}
                    target="_blank"
                  >
                    <Button
                      size="sm"
                      variant="primary"
                      rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                    >
                      Open in Verification Portal
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Student Record Modal */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-900 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 ring-1 ring-emerald-700 text-white shadow-xs">
                  <Pencil className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Edit Student Record</h3>
                  <p className="text-xs text-emerald-200/80">
                    Update graduate credentials in official Senate registry
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCert(null)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={editFormData.fullName || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Matric Number"
                  value={editFormData.matricNumber || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, matricNumber: e.target.value })
                  }
                  required
                />
                <Input
                  label="Certificate Number"
                  placeholder="e.g. NSUK/SR-FT/2024/2025/1102"
                  value={editFormData.certificateNumber || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, certificateNumber: e.target.value })
                  }
                />
                <Input
                  label="Class of Degree"
                  value={editFormData.classOfDegree || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, classOfDegree: e.target.value })
                  }
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Programme / Degree Awarded"
                    value={editFormData.degreeAwarded || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, degreeAwarded: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  label="Faculty"
                  value={editFormData.faculty || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, faculty: e.target.value })
                  }
                  required
                />
                <Input
                  label="Department"
                  value={editFormData.department || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, department: e.target.value })
                  }
                  required
                />
                <Input
                  label="Graduation Year"
                  value={editFormData.graduationYear || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, graduationYear: e.target.value })
                  }
                />
                <Input
                  label="Senate Approval Date"
                  value={editFormData.senateApprovalDate || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, senateApprovalDate: e.target.value })
                  }
                />
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Record Verification Status
                  </label>
                  <select
                    value={editFormData.status || "VERIFIED"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value as "PENDING" | "VERIFIED" | "SUSPENDED" | "REVOKED",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                  >
                    <option value="VERIFIED">VERIFIED (Official Valid Graduate)</option>
                    <option value="PENDING">PENDING (Awaiting Certificate Generation)</option>
                    <option value="SUSPENDED">SUSPENDED (Temporarily Held)</option>
                    <option value="REVOKED">REVOKED (Discredited / Cancelled)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSavingEdit}
                  onClick={() => setEditingCert(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingEdit}
                  leftIcon={<Check className="h-4 w-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Dialog */}
      {deletingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Student Record?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete the graduate record for{" "}
                  <strong className="text-slate-900">{deletingCert.fullName}</strong> (
                  <span className="font-mono text-emerald-800 font-semibold">
                    {deletingCert.certificateNumber || deletingCert.matricNumber}
                  </span>
                  )? This credential will be completely removed from the official Senate database.
                </p>
                {deleteError && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeletingCert(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={isDeleting}
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={handleConfirmDelete}
              >
                Delete Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
