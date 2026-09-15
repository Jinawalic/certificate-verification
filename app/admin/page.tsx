"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  KeyRound,
  AlertTriangle
} from "lucide-react";
import { Footer } from "@/components/Footer";

export default function AdminPortalPreviewPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin/dashboard");
  };

  return (
    <div
      className="relative min-h-screen flex flex-col justify-between bg-cover bg-center"
      style={{ backgroundImage: "url('/images/herobg.webp')" }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-emerald-950/50 backdrop-blur-[2px]" />

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="w-full overflow-hidden rounded-2xl border border-emerald-800/20 bg-white shadow-2xl">
          {/* Header */}
          <div className="border-b border-emerald-900/10 bg-emerald-900 px-6 py-6 text-white">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white ring-1 ring-emerald-600">
                <Lock className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">University Registry & Senate Portal</h1>
                <p className="text-xs text-emerald-200/80">Authorized Registrar Officers & Senate Verification</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-1">
              {/* Left Column: Login Simulation / Access Gate */}
              <div>
                <h2 className="text-base font-bold text-slate-900">Officer Authentication</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Please authenticate using your institutional NSUK identity credentials.
                </p>

                <form onSubmit={handleSimulateLogin} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Staff Email
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
            </div>
          </div>
        </div>
      </div>

      {/* Footer Component */}
      <div className="relative z-15 w-full">
        <Footer />
      </div>
    </div>
  );
}