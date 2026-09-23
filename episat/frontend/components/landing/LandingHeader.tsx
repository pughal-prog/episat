"use client";

import Link from "next/link";
import { ArrowRight, Moon, Sun, Shield, Activity, Radio, Cpu } from "lucide-react";

interface LandingHeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export function LandingHeader({ darkMode, setDarkMode }: LandingHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 border-b backdrop-blur-md ${
        darkMode
          ? "bg-[#071311]/90 border-teal-brand/30 text-slate-100"
          : "bg-paper-raised/90 border-ink/20 text-ink"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded bg-teal-brand text-paper flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight leading-none">
                EpiSat <span className="font-mono text-[10px] px-1.5 py-0.5 bg-teal-brand text-paper rounded ml-1 font-normal">2.0</span>
              </span>
              <span className="font-mono text-[10px] text-teal-brand font-medium tracking-wide">
                PUBLIC HEALTH INTELLIGENCE
              </span>
            </div>
          </Link>

          <span
            className={`hidden md:inline-block font-mono text-[11px] px-2 py-0.5 rounded border ${
              darkMode
                ? "bg-teal-brand/20 border-teal-brand/40 text-teal-300"
                : "bg-teal-brand/10 border-teal-brand/20 text-teal-brand"
            }`}
          >
            SIH 2026 Space Technology
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 font-mono text-xs">
          <a
            href="#hero"
            className="hover:text-teal-brand transition-colors flex items-center space-x-1"
          >
            <span>Overview</span>
          </a>
          <a
            href="#live-preview"
            className="hover:text-teal-brand transition-colors flex items-center space-x-1"
          >
            <Radio className="w-3 h-3 text-risk-critical animate-pulse" />
            <span>Risk Map</span>
          </a>
          <a
            href="#problem"
            className="hover:text-teal-brand transition-colors"
          >
            Problem
          </a>
          <a
            href="#pipeline"
            className="hover:text-teal-brand transition-colors"
          >
            Pipeline
          </a>
          <a
            href="#capabilities"
            className="hover:text-teal-brand transition-colors"
          >
            Capabilities
          </a>
          <a
            href="#technology"
            className="hover:text-teal-brand transition-colors"
          >
            Technology
          </a>
          <a
            href="#roadmap"
            className="hover:text-teal-brand transition-colors"
          >
            Roadmap
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`p-2 rounded-md border transition-colors ${
              darkMode
                ? "bg-teal-brand/20 border-teal-brand/40 text-amber-300 hover:bg-teal-brand/40"
                : "bg-paper border-ink/20 text-ink hover:bg-paper-raised"
            }`}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary CTA */}
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-teal-brand text-paper rounded font-medium hover:bg-teal-deep shadow-sm transition-all flex items-center space-x-1.5 group"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
}
