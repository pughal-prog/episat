"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, Sparkles, MessageSquare, Satellite, Radio, CheckCircle, Clock } from "lucide-react";

interface RoadmapSectionProps {
  darkMode: boolean;
}

const ROADMAP_ITEMS = [
  {
    phase: "PHASE 1 (Q4 2026)",
    title: "Multi-Disease Spatial Expansion",
    desc: "Extending suitability ML algorithms beyond Dengue to Malaria (Anopheles species) and Chikungunya vector dynamics.",
    status: "IN DEVELOPMENT",
    icon: Compass,
  },
  {
    phase: "PHASE 2 (Q1 2027)",
    title: "NVBDCP & IHIP API Integration",
    desc: "Building secure bi-directional API connectors for national public health surveillance systems (IHIP gateway).",
    status: "PLANNED",
    icon: Radio,
  },
  {
    phase: "PHASE 3 (Q2 2027)",
    title: "Automated Officer Alert Dispatch",
    desc: "Multi-lingual WhatsApp & SMS instant alerts triggered whenever a 500m cell transitions into Critical risk tier.",
    status: "PLANNED",
    icon: MessageSquare,
  },
  {
    phase: "PHASE 4 (Q3 2027)",
    title: "Planet 3m High-Res Auto Triggering",
    desc: "Automated tasking of high-resolution commercial satellite imagery upon critical risk detection in urban hotspots.",
    status: "RESEARCH",
    icon: Satellite,
  },
];

export function RoadmapSection({ darkMode }: RoadmapSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="roadmap" className={`py-16 md:py-24 border-t transition-colors ${darkMode ? "bg-[#061210] border-teal-brand/30" : "bg-paper-raised border-ink/20"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full font-mono text-xs text-teal-brand bg-teal-brand/10 border border-teal-brand/30 mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Honest & Transparent Roadmap</span>
          </div>
          <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 ${darkMode ? "text-slate-100" : "text-ink"}`}>
            Future evolution of EpiSat <br />
            <span className="italic text-teal-brand font-serif">vector intelligence platform.</span>
          </h2>
          <p className={`font-sans text-base sm:text-lg leading-relaxed ${darkMode ? "text-slate-300" : "text-ink-muted"}`}>
            Planned platform expansions following SIH 2026 validation — maintaining rigorous scientific integrity and non-overclaiming rules.
          </p>
        </div>

        {/* 4 Roadmap Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
          {ROADMAP_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`p-6 rounded-xl border flex flex-col justify-between ${
                  darkMode ? "bg-[#0b1c19] border-teal-brand/20" : "bg-paper border-ink/20 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-teal-brand font-bold uppercase tracking-wider">
                      {item.phase}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-paper-raised border border-ink/20 text-ink-muted">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 mb-2">
                    <Icon className="w-4 h-4 text-teal-brand" />
                    <h3 className="font-serif font-bold text-base text-ink">{item.title}</h3>
                  </div>

                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-ink/10 text-[10px] text-ink-muted flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-teal-brand" />
                  <span>Next Development Cycle</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
