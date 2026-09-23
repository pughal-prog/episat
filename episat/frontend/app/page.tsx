"use client";

import { useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { RiskMapPreview } from "@/components/landing/RiskMapPreview";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionPipelineSection } from "@/components/landing/SolutionPipelineSection";
import { CapabilitiesSection } from "@/components/landing/CapabilitiesSection";
import { ImpactSection } from "@/components/landing/ImpactSection";
import { TechStackSection } from "@/components/landing/TechStackSection";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans selection:bg-teal-brand selection:text-paper ${
        darkMode ? "bg-[#071311] text-slate-100 dark" : "bg-paper text-ink"
      }`}
    >
      <LandingHeader darkMode={darkMode} setDarkMode={setDarkMode} />
      <main>
        <HeroSection darkMode={darkMode} />
        <RiskMapPreview darkMode={darkMode} />
        <ProblemSection darkMode={darkMode} />
        <SolutionPipelineSection darkMode={darkMode} />
        <CapabilitiesSection darkMode={darkMode} />
        <ImpactSection darkMode={darkMode} />
        <TechStackSection darkMode={darkMode} />
        <RoadmapSection darkMode={darkMode} />
      </main>
      <LandingFooter darkMode={darkMode} />
    </div>
  );
}
