import React from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { SearchBar } from "@/components/SearchBar";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-academic-pattern text-slate-900 selection:bg-emerald-800 selection:text-white">
      {/* 1. Navbar */}
      <Header />

      {/* Main Container: Single-Section Hero & Search Layout */}
      <main className="flex-1 flex flex-col justify-center py-6 sm:py-10 md:py-1">
        <div className="w-full">
          {/* 2. Hero Content */}
          <HeroSection />

          {/* 3. Search Section directly below Hero */}
          <div className="mt-3 sm:mt-5">
            <SearchBar />
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
