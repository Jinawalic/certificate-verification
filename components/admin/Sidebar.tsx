"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  ExternalLink,
  LogOut,
  ShieldCheck,
  X,
  UserCheck
} from "lucide-react";

export type AdminDashboardTab = "records" | "issue" | "overview";

export interface SidebarOfficerUser {
  name: string;
  email?: string;
  role?: string;
  department?: string | null;
}

export interface SidebarProps {
  /** Current active navigation tab */
  activeTab: AdminDashboardTab;
  /** Tab change callback */
  onSelectTab: (tab: AdminDashboardTab) => void;
  /** Mobile open state */
  isOpen?: boolean;
  /** Mobile close handler */
  onClose?: () => void;
  /** Optional sign-out callback */
  onSignOut?: () => void;
  /** Total records count badge */
  recordsCount?: number;
  /** Currently logged in admin profile */
  currentUser?: SidebarOfficerUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen = false,
  onClose,
  onSignOut,
  recordsCount = 0,
  currentUser = null,
}) => {
  const handleNavClick = (tab: AdminDashboardTab) => {
    onSelectTab(tab);
    if (onClose) onClose();
  };

  const navItems = [
    {
      id: "overview" as AdminDashboardTab,
      label: "Dashboard Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "issue" as AdminDashboardTab,
      label: "Upload Students",
      icon: FilePlus2,
      badge: "New",
    },
    {
      id: "records" as AdminDashboardTab,
      label: "Issued Records",
      icon: FileText,
      badge: recordsCount > 0 ? String(recordsCount) : null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-150"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-emerald-900/10 bg-white shadow-xl lg:shadow-none transition-transform duration-200 lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Institutional Branding Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <img
              src="/images/nsuklogo.png"
              alt="NSUK Logo"
              className="h-10 w-10 shrink-0 rounded-xl bg-white p-0.5 object-contain ring-1 ring-emerald-500/30"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-tight">
                NSUK Registry
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                Senate Admin Portal
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white lg:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Security Badge Pill */}
        <div className="mx-4 mt-4 rounded-xl bg-emerald-50 p-3 border border-emerald-800/15 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-800 text-white shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold text-emerald-950 leading-tight">
              Officer Clearance Level 3
            </p>
            <p className="text-[10px] text-emerald-700 truncate">
              Senate Verified Registrar Key
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-5 overflow-y-auto">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all cursor-pointer ${isActive
                  ? "bg-emerald-800 text-white shadow-sm shadow-emerald-900/20"
                  : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-emerald-300" : "text-emerald-800"
                      }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-100 text-emerald-900"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-4 border-t border-slate-100" />

          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            External Links
          </p>

          <Link
            href="/"
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink className="h-4 w-4 text-slate-400" />
              <span>Public Verification Portal</span>
            </span>
          </Link>
        </nav>

        {/* Officer Profile & Sign-Out Section */}
        <div className="border-t border-slate-200/80 bg-slate-50/70 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white font-bold text-xs shadow-xs uppercase">
              {currentUser?.name ? (
                currentUser.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
              ) : (
                <UserCheck className="h-4 w-4 text-emerald-300" />
              )}
            </div>
            <div className="overflow-hidden">
              <p
                className="truncate text-xs font-bold text-slate-900"
                title={currentUser?.name || "Dr. Al-Hassan Mohammed"}
              >
                {currentUser?.name || "Dr. Al-Hassan Mohammed"}
              </p>
              <p
                className="text-[10px] text-slate-500 truncate"
                title={
                  currentUser?.role === "REGISTRAR"
                    ? "Deputy Registrar (Academic Affairs)"
                    : currentUser?.role === "SUPER_ADMIN"
                    ? "Super Administrator (Senate)"
                    : currentUser?.department || currentUser?.role || "Academic Registry Officer"
                }
              >
                {currentUser?.role === "REGISTRAR"
                  ? "Deputy Registrar (Academic Affairs)"
                  : currentUser?.role === "SUPER_ADMIN"
                  ? "Super Administrator (Senate)"
                  : currentUser?.department || currentUser?.role || "Academic Registry Officer"}
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-xs"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>Sign Out from Console</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
