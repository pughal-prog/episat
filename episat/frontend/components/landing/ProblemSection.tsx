"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { AlertCircle, Clock, CheckCircle2, XCircle, ArrowRight, ShieldAlert } from "lucide-react";

interface ProblemSectionProps {
  darkMode: boolean;
}

export function ProblemSection({ darkMode }: ProblemSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="problem" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full font-mono text-xs text-risk-high bg-risk-high/10 border border-risk-high/30 mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>The Vector Surveillance Blind Spot</span>
          </div>
          <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6 ${darkMode ? "text-slate-100" : "text-ink"}`}>
            Reactive surveillance arrives <br />
            <span className="italic text-risk-high font-serif">4 to 6 weeks too late.</span>
          </h2>
          <p className={`font-sans text-base sm:text-lg leading-relaxed ${darkMode ? "text-slate-300" : "text-ink-muted"}`}>
            Traditional public health systems wait for clinical case reports and hospital admissions before initiating vector control. By the time a dengue outbreak is officially confirmed, virus transmission has already peaked.
          </p>
        </motion.div>
      </div>

      {/* Animated Counter Headline Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`p-6 rounded-xl border text-center font-mono ${
            darkMode ? "bg-[#0c1e1a] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div className="text-xs uppercase text-ink-muted font-semibold tracking-wider">CRITICAL BLIND SPOT</div>
          <div className="font-serif text-4xl sm:text-5xl font-bold text-risk-high my-2">
            <AnimatedCounter value={4} suffix="–" />
            <AnimatedCounter value={6} suffix=" Wks" />
          </div>
          <div className="text-xs text-ink-muted">Lag Between Breeding & Clinical Data</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`p-6 rounded-xl border text-center font-mono ${
            darkMode ? "bg-[#0c1e1a] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div className="text-xs uppercase text-ink-muted font-semibold tracking-wider">ANNUAL GLOBAL BURDEN</div>
          <div className="font-serif text-4xl sm:text-5xl font-bold text-teal-brand my-2">
            <AnimatedCounter value={5.2} decimals={1} suffix="M+" />
          </div>
          <div className="text-xs text-ink-muted">Dengue Cases Reported Annually</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`p-6 rounded-xl border text-center font-mono ${
            darkMode ? "bg-[#0c1e1a] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div className="text-xs uppercase text-ink-muted font-semibold tracking-wider">REACTIVE RESPONSE DELAY</div>
          <div className="font-serif text-4xl sm:text-5xl font-bold text-risk-critical my-2">
            <AnimatedCounter value={85} suffix="%" />
          </div>
          <div className="text-xs text-ink-muted">Vector Control Deployed Post-Surge</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className={`p-6 rounded-xl border text-center font-mono ${
            darkMode ? "bg-[#0c1e1a] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div className="text-xs uppercase text-ink-muted font-semibold tracking-wider">SPATIAL GRANULARITY GAP</div>
          <div className="font-serif text-4xl sm:text-5xl font-bold text-amber-600 my-2">
            <AnimatedCounter value={500} suffix="m" />
          </div>
          <div className="text-xs text-ink-muted">EpiSat Hyperlocal vs 20km District Avg</div>
        </motion.div>
      </div>

      {/* Comparison Paradigm: Traditional Reactive vs. EpiSat Predictive */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Traditional Card */}
        <div
          className={`p-6 sm:p-8 rounded-xl border font-sans relative overflow-hidden ${
            darkMode ? "bg-[#141215] border-red-900/40 text-slate-200" : "bg-red-50/50 border-red-200 text-ink"
          }`}
        >
          <div className="flex items-center space-x-2 font-mono text-xs font-bold text-risk-critical uppercase mb-4">
            <XCircle className="w-4 h-4" />
            <span>Legacy Reactive Surveillance</span>
          </div>
          <h3 className="font-serif text-2xl font-bold mb-4">Clinical Case Confirmation Bottleneck</h3>
          
          <ol className="space-y-4 font-mono text-xs text-ink-muted">
            <li className="flex items-start space-x-3 p-3 rounded bg-red-100/40 border border-red-200">
              <span className="font-bold text-risk-critical">Week 0:</span>
              <span>Heavy rainfall & monsoon flooding create undetected mosquito breeding habitats.</span>
            </li>
            <li className="flex items-start space-x-3 p-3 rounded bg-red-100/40 border border-red-200">
              <span className="font-bold text-risk-critical">Week 2:</span>
              <span>Aedes mosquito larval density surges silently across unmonitored urban sectors.</span>
            </li>
            <li className="flex items-start space-x-3 p-3 rounded bg-red-100/40 border border-red-200">
              <span className="font-bold text-risk-critical">Week 4:</span>
              <span>Patients present fever symptoms; blood samples sent for hospital ELISA lab testing.</span>
            </li>
            <li className="flex items-start space-x-3 p-3 rounded bg-red-100/40 border border-red-200">
              <span className="font-bold text-risk-critical">Week 6:</span>
              <span>District health office receives delayed case reports and orders reactive fogging.</span>
            </li>
          </ol>
          <div className="mt-6 pt-4 border-t border-red-200/60 font-mono text-xs text-risk-critical font-bold">
            Result: Outbreak spreads unchecked before intervention starts.
          </div>
        </div>

        {/* EpiSat Space-to-Action Card */}
        <div
          className={`p-6 sm:p-8 rounded-xl border-2 font-sans relative overflow-hidden ${
            darkMode
              ? "bg-[#0b211d] border-teal-brand/60 text-slate-100"
              : "bg-teal-50/50 border-teal-brand/40 text-ink"
          }`}
        >
          <div className="flex items-center space-x-2 font-mono text-xs font-bold text-teal-brand uppercase mb-4">
            <CheckCircle2 className="w-4 h-4 text-teal-brand" />
            <span>EpiSat Space-to-Action Surveillance</span>
          </div>
          <h3 className="font-serif text-2xl font-bold mb-4">Early Environmental Vector Warning</h3>
          
          <ol className="space-y-4 font-mono text-xs text-ink-muted">
            <li className="flex items-start space-x-3 p-3 rounded bg-teal-100/50 border border-teal-200/80">
              <span className="font-bold text-teal-brand">Day 0:</span>
              <span>Sentinel-2 NDWI detects standing surface water & MODIS tracks temp anomalies.</span>
            </li>
            <li className="flex items-start space-x-3 p-3 rounded bg-teal-100/50 border border-teal-200/80">
              <span className="font-bold text-teal-brand">Day 1:</span>
              <span>AI Multi-Horizon model computes Mosquito BSI (0-100) per 500m cell.</span>
            </li>
            <li className="flex items-start space-x-3 p-3 rounded bg-teal-100/50 border border-teal-200/80">
              <span className="font-bold text-teal-brand">Day 2:</span>
              <span>SHAP XAI isolates exact driver; intervention engine prioritizes targeted larviciding.</span>
            </li>
            <li className="flex items-start space-x-3 p-3 rounded bg-teal-100/50 border border-teal-200/80">
              <span className="font-bold text-teal-brand">Day 3:</span>
              <span>Public health officers deploy targeted vector control 21 days before clinical spike.</span>
            </li>
          </ol>
          <div className="mt-6 pt-4 border-t border-teal-200/80 font-mono text-xs text-teal-brand font-bold">
            Result: Outbreak contained at vector breeding phase before clinical transmission.
          </div>
        </div>
      </motion.div>
    </section>
  );
}
