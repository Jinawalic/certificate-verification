"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  KeyRound, 
  FileSpreadsheet, 
  Users, 
  Database,
  Building,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export default function AdminPortalPreviewPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("Access restricted: Production authentication keys are being deployed by NSUK ICT & Registry Directorate. Shared design tokens and layout wrapper are pre-configured.");
  };

  return (
    <LayoutWrapper variant="admin" pageTitle="NSUK Admin Verification Console">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Public Verification Portal</span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-800/20 bg-white shadow-xl">
          {/* Header */}
          <div className="border-b border-emerald-900/10 bg-emerald-900 px-6 py-6 text-white sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-800 text-white ring-1 ring-emerald-600">
                <Lock className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">University Registry & Senate Portal</h1>
                <p className="text-xs text-emerald-200/80">Authorized Registrar Officers & Senate Verification</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Upcoming Phase 2
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Login Simulation / Access Gate */}
              <div>
                <h2 className="text-base font-bold text-slate-900">Officer Authentication</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Please authenticate using your institutional NSUK identity credentials and YubiKey or 2FA token.
                </p>

                <form onSubmit={handleSimulateLogin} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Staff Institutional Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. registrar@nsuk.edu.ng"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Security Passcode / Hardware Key
                    </label>
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Access Admin Console</span>
                  </button>
                </form>

                {notice && (
                  <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{notice}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Upcoming Admin Capabilities */}
              <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Shared Design Tokens & Architecture
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    The admin console is pre-architected to seamlessly utilize the same Tailwind tokens (`emerald-800`, `LayoutWrapper`, `verification.ts`):
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900">Batch Certificate Issuance</span>
                        <p className="text-slate-500">Bulk upload Senate-approved graduation cohorts.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Database className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900">Revocation & Status Audit</span>
                        <p className="text-slate-500">Real-time status flagging with cryptographic trail.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Users className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900">Role-Based Access (RBAC)</span>
                        <p className="text-slate-500">Dean of Faculty and Registrar clearance levels.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Aligned with NSUK Information & Communication Technology Standards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
