"use client";

import Link from "next/link";
import { ArrowRight, Shield, ArrowUp, ExternalLink } from "lucide-react";

interface LandingFooterProps {
  darkMode: boolean;
}

export function LandingFooter({ darkMode }: LandingFooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={`border-t transition-colors ${
        darkMode ? "bg-[#040d0c] border-teal-brand/30 text-slate-200" : "bg-paper-raised border-ink/20 text-ink"
      }`}
    >
      {/* Final CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center border-b border-ink/15">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full font-mono text-xs text-teal-brand bg-teal-brand/10 border border-teal-brand/30 mb-6">
            <Shield className="w-3.5 h-3.5" />
            <span>Ready for Public Health Intelligence</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-6">
            Experience the EpiSat Command Center.
          </h2>

          <p className="font-sans text-base sm:text-lg text-ink-muted mb-8 max-w-2xl mx-auto leading-relaxed">
            Explore 500m spatial risk grid forecasting, SHAP explainability drivers, and automated vector intervention recommendations.
          </p>

          <div className="flex flex-wrap justify-center gap-4 font-mono text-sm">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-teal-brand text-paper font-medium rounded-md hover:bg-teal-deep shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 group"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Info & SIH Attribution Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-ink-muted">
        <div className="flex items-center space-x-3">
          <span className="font-serif font-bold text-sm text-ink">EpiSat 2.0</span>
          <span>|</span>
          <span>SIH26209 • Space Technology Theme</span>
        </div>

        <div className="text-center md:text-right">
          <div>AICTE Student Innovation Platform • Earth Observation & Public Health Intelligence</div>
          <div className="text-[11px] opacity-75 mt-0.5">Scientific Positioning: Environmental breeding suitability early warning.</div>
        </div>

        <button
          onClick={scrollToTop}
          className="p-2 rounded border border-ink/20 hover:bg-teal-brand hover:text-paper transition-colors flex items-center space-x-1"
          title="Scroll to Top"
        >
          <span>Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
}
