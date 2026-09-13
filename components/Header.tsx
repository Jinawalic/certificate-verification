"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Menu, X, Award } from "lucide-react";
import { UploadCertificateModal } from "./UploadCertificateModal";

export interface HeaderProps {
  /** Optional custom title or university branch */
  universityName?: string;
  /** Sub-header label */
  subTitle?: string;
  /** Callback or link to verify section */
  verifyHref?: string;
}

export const Header: React.FC<HeaderProps> = ({
  universityName = "Nasarawa State University, Keffi",
  subTitle = "Academic Records & Certification Division",
  verifyHref = "/",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 bg-white/95 backdrop-blur-md transition-all">
        {/* Top Institutional Notification Bar */}
        <div className="bg-emerald-950 px-4 py-1.5 text-xs text-emerald-100/90 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Official NSUK Senate & Registry Digital Verification System &bull; Accredited & Secured</span>
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Institutional Branding */}
          <Link
            href={verifyHref}
            className="group flex items-center gap-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 rounded-lg py-1 px-1.5 transition-colors"
          >
            {/* University Crest / Emerald Icon */}
            <img src="/images/nsuklogo.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />

            {/* University Title & Subtitle */}
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-emerald-950 sm:text-lg leading-tight group-hover:text-emerald-800 transition-colors">
                {universityName}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {subTitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50 cursor-pointer border border-transparent hover:border-emerald-800/20"
            >
              <Award className="h-4 w-4 text-emerald-700" />
              <span>Verify Certificate</span>
            </button>

            <a
              href="https://nsuk.edu.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-emerald-800 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
            >
              <span>NSUK Main Portal</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-emerald-900/10 bg-white px-4 pt-2 pb-6 shadow-xl md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setUploadModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-semibold text-emerald-950 hover:bg-emerald-50 text-left cursor-pointer"
              >
                <Award className="h-5 w-5 text-emerald-700" />
                <span>Verify Certificate</span>
              </button>
              <a
                href="https://nsuk.edu.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                <span>NSUK Official Website</span>
                <ExternalLink className="h-4 w-4 opacity-50" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Upload Certificate Modal */}
      <UploadCertificateModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </>
  );
};
