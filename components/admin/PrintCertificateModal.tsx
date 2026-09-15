"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Printer,
  Download,
  Eye,
  X,
  GraduationCap,
  Building2,
  FileCheck2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Button } from "./Button";
import { StatementOfResultTemplate } from "@/components/StatementOfResultTemplate";
import { VerifiedCertificate } from "@/lib/verification";

interface PrintCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: VerifiedCertificate[];
  initialStudent?: VerifiedCertificate | null;
}

export const PrintCertificateModal: React.FC<PrintCertificateModalProps> = ({
  isOpen,
  onClose,
  students,
  initialStudent = null,
}) => {
  // Department selection state
  const departments = useMemo(() => {
    const set = new Set(students.map((s) => s.department).filter(Boolean));
    return ["All Departments", ...Array.from(set)];
  }, [students]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>("All Departments");

  // Filter students based on department
  const filteredStudents = useMemo(() => {
    if (selectedDepartment === "All Departments") {
      return students;
    }
    return students.filter((s) => s.department === selectedDepartment);
  }, [students, selectedDepartment]);

  // Selected student state for printing
  const [selectedStudentCertNumber, setSelectedStudentCertNumber] = useState<string>(() => {
    if (initialStudent) return initialStudent.certificateNumber;
    return students[0]?.certificateNumber || "";
  });

  // Preview student state (set after clicking "Preview")
  const [previewStudent, setPreviewStudent] = useState<VerifiedCertificate | null>(() => {
    if (initialStudent) return initialStudent;
    return students[0] || null;
  });

  // Zoom scale state for previewing 794x1123 A4 in modal
  const [zoomScale, setZoomScale] = useState<number>(0.68);
  const [isPrinting, setIsPrinting] = useState(false);

  // Sync when initialStudent changes
  React.useEffect(() => {
    if (initialStudent) {
      setSelectedDepartment(initialStudent.department || "All Departments");
      setSelectedStudentCertNumber(initialStudent.certificateNumber);
      setPreviewStudent(initialStudent);
    }
  }, [initialStudent]);

  if (!isOpen) return null;

  // Handle department change
  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    const available = dept === "All Departments" ? students : students.filter((s) => s.department === dept);
    if (available.length > 0) {
      setSelectedStudentCertNumber(available[0].certificateNumber);
    } else {
      setSelectedStudentCertNumber("");
    }
  };

  // Handle Preview Click
  const handlePreview = () => {
    const found = students.find((s) => s.certificateNumber === selectedStudentCertNumber);
    if (found) {
      setPreviewStudent(found);
    }
  };

  // Handle Professional Print to PDF
  const handlePrint = () => {
    if (!previewStudent) return;
    setIsPrinting(true);

    const certElem = document.getElementById("printable-statement-of-result");
    if (!certElem) {
      setIsPrinting(false);
      return;
    }

    // Create an isolated printing iframe
    const printIframe = document.createElement("iframe");
    printIframe.style.position = "fixed";
    printIframe.style.right = "0";
    printIframe.style.bottom = "0";
    printIframe.style.width = "0";
    printIframe.style.height = "0";
    printIframe.style.border = "0";
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow?.document;
    if (!doc) {
      setIsPrinting(false);
      return;
    }

    const title = `NSUK_Certificate_${previewStudent.matricNumber.replace(/[\/\\]/g, "-")}`;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
                background: #ffffff;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #ffffff;
              font-family: "Times New Roman", Times, serif;
            }
          </style>
          <!-- Link to tailwind compiled styles from next.js -->
          <link rel="stylesheet" href="/_next/static/css/app/layout.css" />
        </head>
        <body>
          <div style="width: 794px; height: 1123px; position: relative;">
            ${certElem.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    printIframe.contentWindow?.focus();
    setTimeout(() => {
      printIframe.contentWindow?.print();
      setIsPrinting(false);
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 2000);
    }, 600);
  };

  // Format serial number cleanly from certificate number
  const formatSerialNumber = (certNum: string) => {
    if (certNum.startsWith("NSUK/SR-")) {
      return certNum.replace("NSUK/SR-", "");
    }
    if (certNum.startsWith("NSUK/")) {
      return certNum.replace("NSUK/", "");
    }
    return certNum;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 md:p-6 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] max-h-[960px] rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-900 px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 ring-1 ring-emerald-700 text-white shadow-xs">
              <Printer className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Print Official Certificate / Statement of Result
              </h3>
              <p className="text-xs text-emerald-200/80">
                Nasarawa State University, Keffi &bull; Senate Academic Records Division
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selection & Action Toolbar */}
        <div className="border-b border-slate-200 bg-slate-50/90 p-4 sm:px-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-2xl">
            {/* 1. Department Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-800" />
                <span>Select Department</span>
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 cursor-pointer shadow-2xs"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Student Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-800" />
                <span>Select Student</span>
              </label>
              <select
                value={selectedStudentCertNumber}
                onChange={(e) => setSelectedStudentCertNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 cursor-pointer shadow-2xs truncate"
              >
                {filteredStudents.length === 0 ? (
                  <option value="">No students in this department</option>
                ) : (
                  filteredStudents.map((s) => (
                    <option key={s.certificateNumber} value={s.certificateNumber}>
                      {s.fullName} ({s.matricNumber})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Action Buttons: Preview and Print */}
          <div className="flex items-center gap-2.5 self-end lg:self-center pt-2 lg:pt-0">
            {/* Preview Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Eye className="h-4 w-4 text-emerald-800" />}
              onClick={handlePreview}
              disabled={!selectedStudentCertNumber}
            >
              Preview Certificate
            </Button>

            {/* Print & Download PDF Button */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
              isLoading={isPrinting}
              onClick={handlePrint}
              disabled={!previewStudent}
            >
              Print / Save as PDF
            </Button>
          </div>
        </div>

        {/* Certificate Preview Body Area */}
        <div className="flex-1 overflow-auto bg-slate-200/60 p-4 sm:p-6 flex flex-col items-center justify-start relative">
          
          {/* Zoom Controller Floating Bar */}
          {previewStudent && (
            <div className="sticky top-2 z-20 mb-4 inline-flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur-md px-3 py-1.5 text-xs text-white shadow-lg">
              <span className="font-semibold text-slate-300 mr-1">Preview Zoom:</span>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(0.45, z - 0.08))}
                className="p-1 hover:text-emerald-300 rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="font-mono font-bold w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(1.0, z + 0.08))}
                className="p-1 hover:text-emerald-300 rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(0.68)}
                className="ml-1 text-[11px] text-emerald-300 hover:underline cursor-pointer"
              >
                Fit
              </button>
            </div>
          )}

          {/* Certificate Display or Empty State */}
          {previewStudent ? (
            <div className="transition-transform duration-200 ease-out origin-top pb-12">
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "top center",
                }}
              >
                <StatementOfResultTemplate
                  id="printable-statement-of-result"
                  studentName={previewStudent.fullName}
                  degreeType={previewStudent.degreeAwarded}
                  degreeClass={previewStudent.classOfDegree}
                  issueDate={previewStudent.dateOfIssue || previewStudent.senateApprovalDate || "5th December, 2024"}
                  serialNumber={formatSerialNumber(previewStudent.certificateNumber)}
                />
              </div>
            </div>
          ) : (
            <div className="my-auto flex flex-col items-center justify-center p-8 text-center max-w-md bg-white rounded-2xl border border-slate-300 shadow-xs">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 mb-4 ring-1 ring-emerald-800/20">
                <FileCheck2 className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                No Certificate Currently in Preview
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Choose an academic department and select a candidate from the dropdown controls above, then click <strong>"Preview Certificate"</strong> to render the official Statement of Result.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-white px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              Official Senate Statement of Result Template &bull; Standard A4 Dimensions (794 &times; 1123px)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Printer className="h-4 w-4" />}
              isLoading={isPrinting}
              onClick={handlePrint}
              disabled={!previewStudent}
            >
              Print / Save as PDF
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
