"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Footer } from "@/components/Footer";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("registrar@nsuk.edu.ng");
  const [password, setPassword] = useState("12345678");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      setSuccessMessage(data.message || "Authentication verified. Redirecting to Senate Console...");
      
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error occurred.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col justify-between bg-cover bg-center"
      style={{ backgroundImage: "url('/images/herobg.webp')" }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[3px]" />

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-lg px-4 py-12 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="w-full overflow-hidden rounded-2xl border border-emerald-700/30 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="border-b border-emerald-900/10 bg-emerald-900 px-6 py-6 text-white">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white ring-1 ring-emerald-600 shadow-md">
                <Lock className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">University Registry & Senate Portal</h1>
                <p className="text-xs text-emerald-200/90 font-medium">Senate Academic Records Division</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900">Institutional Officer Authentication</h2>
            <p className="mt-1 text-xs text-slate-500">
              Please authenticate using your institutional NSUK identity credentials to access the central certificate register.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {/* Error Notice */}
              {errorMessage && (
                <div className="rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Success Notice */}
              {successMessage && (
                <div className="rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-900 border border-emerald-200 flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Institutional Staff Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. registrar@nsuk.edu.ng"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Security Passcode
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security passcode"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-900 disabled:opacity-70 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Access Admin Console</span>
                  </>
                )}
              </button>
            </form>

            {/* Institutional Credentials Badge */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span className="font-semibold text-slate-700">Official Senate Registry Gate</span>
              </div>
              <span className="font-mono text-emerald-800 font-bold">SHA-256 Auth</span>
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