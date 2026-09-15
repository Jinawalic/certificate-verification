"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import {
  Upload,
  FileCheck,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { Button } from "./Button";

export interface UploadTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateApplied?: (fileName: string) => void;
}

export const UploadTemplateModal: React.FC<UploadTemplateModalProps> = ({
  isOpen,
  onClose,
  onTemplateApplied,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    setIsSuccess(false);

    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please select an official PDF, PNG, JPG, or WebP certificate file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("File exceeds the 15MB limit. Please select a smaller file.");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIsSuccess(true);
      if (onTemplateApplied) {
        onTemplateApplied(selectedFile.name);
      }
    }, 1200);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 ring-1 ring-emerald-700 text-white shadow-xs">
              <FileCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Upload Certificate Template</h3>
              <p className="text-xs text-emerald-200/80">
                Upload official Senate certificate design from device
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {isSuccess ? (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-3.5 shadow-xs">
                <CheckCircle2 className="h-7 w-7 text-emerald-700" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Certificate Template Successfully Uploaded
              </h4>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Template <strong>{selectedFile?.name}</strong> has been linked to the Senate digital printing & verification registry.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2.5">
                <Button variant="primary" size="sm" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              {!selectedFile ? (
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
                    Click to browse your device or drag & drop template
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs">
                    Supports high-resolution PDF, PNG, JPG, or WebP certificate template designs (up to 15MB)
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>Select Template File</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-800/20 bg-emerald-50/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs">
                        {selectedFile.type === "application/pdf" ? (
                          <FileText className="h-6 w-6 text-emerald-200" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-emerald-200" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull;{" "}
                          {selectedFile.type === "application/pdf" ? "PDF Document" : "Image Template"}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                          Ready for template deployment
                        </span>
                      </div>
                    </div>

                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 max-h-40 bg-white flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Template preview"
                        className="max-h-40 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {errorMessage && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Senate Ratified Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!selectedFile}
                    isLoading={isUploading}
                    onClick={handleUpload}
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    Upload & Deploy Template
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
