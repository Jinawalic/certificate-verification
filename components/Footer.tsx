"use client";

import React from "react";
import Link from "next/link";
import { Shield, ExternalLink, HelpCircle, FileText, CheckCircle } from "lucide-react";

export interface FooterProps {
  /** Optional custom copyright year or institution text */
  institutionName?: string;
}

export const Footer: React.FC<FooterProps> = ({
  institutionName = "Nasarawa State University, Keffi",
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white text-slate-600 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Institutional Copyright & Status */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                &copy; {currentYear} {institutionName}. All rights reserved.
              </p>
              <p className="text-[11px] text-slate-500">
                Academic Records & Verification Division &bull; PMB 1022, Keffi, Nasarawa State, Nigeria
              </p>
            </div>
          </div>

          {/* Institutional Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
            <a
              href="https://nsuk.edu.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-emerald-800 transition-colors"
            >
              <span>NSUK Portal</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <span className="hidden sm:inline text-slate-300">&bull;</span>
            <span className="hover:text-emerald-800 cursor-pointer transition-colors flex items-center gap-1">
              <FileText className="h-3 w-3 text-emerald-700" />
              <span>Verification Policy</span>
            </span>
            <span className="hidden sm:inline text-slate-300">&bull;</span>
            <span className="hover:text-emerald-800 cursor-pointer transition-colors flex items-center gap-1">
              <HelpCircle className="h-3 w-3 text-emerald-700" />
              <span>Registry Support</span>
            </span>
            <span className="hidden sm:inline text-slate-300">&bull;</span>
            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
              <CheckCircle className="h-3 w-3 text-emerald-700" />
              <span>NUC Accredited</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
