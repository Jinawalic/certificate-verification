"use client";

import React, { useState, FormEvent } from "react";
import { Search, ArrowRight, AlertCircle } from "lucide-react";
import { SearchVerificationModal } from "./SearchVerificationModal";

export interface SearchBarProps {
  /** Initial certificate number value if any */
  initialValue?: string;
  /** Custom placeholder text */
  placeholder?: string;
  /** Target verification route prefix, defaults to "/verify" */
  verificationBaseRoute?: string;
  /** Callback fired when a verification query is triggered */
  onSearch?: (certificateId: string) => void;
  /** Whether to show quick sample certificate tags */
  showQuickSamples?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = "",
  placeholder = "FT/2023/2024/2543",
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<string>("");

  const handleExecuteSearch = (idToSearch: string) => {
    const trimmed = idToSearch.trim();

    if (!trimmed) {
      setErrorMessage("Please enter a valid certificate number or matriculation ID.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const prefix = "NSUK/SR";
    const cleanedTerm = trimmed.startsWith(prefix)
      ? trimmed
      : `${prefix}/${trimmed.replace(/^\//, "")}`;

    if (onSearch) {
      onSearch(cleanedTerm);
    }

    setTimeout(() => {
      setIsLoading(false);
      setVerifiedRecord(cleanedTerm);
      setIsModalOpen(true);
    }, 300);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(searchTerm);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      {/* Clean Card Container */}
      <div className="relative rounded-2xl bg-white p-4 sm:p-6 ring-1 ring-emerald-900/10 transition-all shadow-xs">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Input Field with NSUK/SR Prefix */}
            <div
              className={`relative flex-1 flex items-center rounded-xl border bg-slate-50/50 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700 ${
                errorMessage
                  ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-200"
                  : "border-slate-200 focus-within:border-emerald-700"
              }`}
            >
              <div className="pointer-events-none flex items-center pl-4 text-slate-400">
                <Search className="h-5 w-5 text-emerald-800/60" />
              </div>
              <span className="pl-3 pr-1 text-sm sm:text-base font-bold text-emerald-900 select-none">
                NSUK/SR
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={placeholder}
                className="w-full bg-transparent py-3.5 pl-1 pr-4 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                aria-label="Certificate number input"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3.5 text-sm sm:text-base font-semibold text-white transition-all hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Record</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>

      {/* Identical Verification Modal Pop-up on Search */}
      <SearchVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        certificateNumber={verifiedRecord}
        onSearchAnother={() => {
          setSearchTerm("");
        }}
      />
    </div>
  );
};