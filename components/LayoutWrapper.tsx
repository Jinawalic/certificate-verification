"use client";

import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export interface LayoutWrapperProps {
  children: React.ReactNode;
  /** Layout mode: 'portal' (public landing/verification) or 'admin' (restricted admin panel) */
  variant?: "portal" | "admin";
  /** Optional custom title or page banner */
  pageTitle?: string;
  /** Optional hide header or footer */
  hideHeader?: boolean;
  hideFooter?: boolean;
  /** Additional custom classNames for the main container */
  mainClassName?: string;
}

/**
 * Standard Layout Wrapper for Nasarawa State University, Keffi Verification System
 * Guarantees visual consistency across public verification routes and future admin modules.
 */
export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  variant = "portal",
  hideHeader = false,
  hideFooter = false,
  mainClassName = "",
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-academic-pattern text-slate-900 selection:bg-emerald-800 selection:text-white">
      {/* Universal Header */}
      {!hideHeader && (
        <Header />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${mainClassName}`}>
        {children}
      </main>

      {/* Universal Institutional Footer */}
      {!hideFooter && <Footer />}
    </div>
  );
};
