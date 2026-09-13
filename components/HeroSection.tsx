"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, Award, Building2 } from "lucide-react";

export interface HeroSectionProps {
  /** Optional badge text override */
  badgeText?: string;
  /** Primary headline */
  headline?: string;
  /** Sub-headline or description */
  description?: string;
  /** Optional institution motto or auxiliary note */
  motto?: string;
  /** Optional slot for additional actions or metrics */
  children?: React.ReactNode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  badgeText = "Official University Verification Portal",
  headline = "Nasarawa State University, Keffi Certificate Verification",
  description = "Validation of academic degrees issued by the Senate and Registry of Nasarawa State University, Keffi.",
  motto = "Knowledge for Development",
  children,
}) => {
  return (
    <section className="relative overflow-hidden  pb-2 sm:pt-2 sm:pb-4 text-center">
      {/* Decorative subtle background elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[380px] w-[600px] rounded-full bg-gradient-to-tr from-emerald-800/10 via-emerald-600/5 to-amber-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Bold Headline */}
        <h1 className=" text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:leading-[1.15]">
          Nasarawa State University{" "}<br />
          <span className="relative inline-block text-emerald-800">
            Certificate Verification
            <svg
              className="absolute -bottom-1.5 left-0 w-full text-amber-500/40 -z-10"
              viewBox="0 0 100 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 5.5C25 1.5 75 1.5 99 5.5"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          System
        </h1>

        {/* Short Description */}
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {description}
        </p>

        {children}
      </div>
    </section>
  );
};
