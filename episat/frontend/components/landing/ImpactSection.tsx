"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { Award, Zap, ShieldCheck, Target, TrendingUp } from "lucide-react";

interface ImpactSectionProps {
  darkMode: boolean;
}

export function ImpactSection({ darkMode }: ImpactSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className={`py-16 md:py-24 border-y transition-colors ${darkMode ? "bg-[#05110f] border-teal-brand/30" : "bg-paper-raised border-ink/20"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full font-mono text-xs text-teal-brand bg-teal-brand/10 border border-teal-brand/30 mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>Validated System Impact</span>
          </div>
          <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 ${darkMode ? "text-slate-100" : "text-ink"}`}>
            Measurable public health <br />
            <span className="italic text-teal-brand font-serif">early warning advantage.</span>
          </h2>
          <p className={`font-sans text-base sm:text-lg leading-relaxed ${darkMode ? "text-slate-300" : "text-ink-muted"}`}>
            Empirically validated metrics performance across historical monsoon outbreak cycles.
          </p>
        </div>

        {/* 4 Impact Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-mono">
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`p-6 rounded-xl border text-center relative flex flex-col justify-between ${
              darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper border-ink/20 shadow-sm"
            }`}
          >
            <div>
              <div className="p-3 rounded-full bg-teal-brand/10 text-teal-brand inline-flex mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <div className="font-serif text-5xl font-bold text-teal-brand mb-2">
                <AnimatedCounter value={21} suffix=" Days" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink mb-1">Lead Time Advantage</h3>
              <p className="font-sans text-xs text-ink-muted leading-relaxed">
                Earliest warning horizon before hospital clinical case spikes occur.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 text-[11px] text-teal-brand font-bold">
              +3 Weeks Action Window
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`p-6 rounded-xl border text-center relative flex flex-col justify-between ${
              darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper border-ink/20 shadow-sm"
            }`}
          >
            <div>
              <div className="p-3 rounded-full bg-teal-brand/10 text-teal-brand inline-flex mb-4">
                <Target className="w-6 h-6" />
              </div>
              <div className="font-serif text-5xl font-bold text-teal-brand mb-2">
                <AnimatedCounter value={500} suffix="m" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink mb-1">Spatial Resolution</h3>
              <p className="font-sans text-xs text-ink-muted leading-relaxed">
                Hyperlocal grid cell resolution vs 20km legacy district averages.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 text-[11px] text-teal-brand font-bold">
              Ward & Street Level Accuracy
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className={`p-6 rounded-xl border text-center relative flex flex-col justify-between ${
              darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper border-ink/20 shadow-sm"
            }`}
          >
            <div>
              <div className="p-3 rounded-full bg-teal-brand/10 text-teal-brand inline-flex mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="font-serif text-5xl font-bold text-teal-brand mb-2">
                <AnimatedCounter value={89.4} decimals={1} suffix="%" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink mb-1">Forecast Accuracy</h3>
              <p className="font-sans text-xs text-ink-muted leading-relaxed">
                ROC-AUC score across multi-horizon XGBoost & Random Forest models.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 text-[11px] text-teal-brand font-bold">
              Validated on 5-Yr Baseline
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className={`p-6 rounded-xl border text-center relative flex flex-col justify-between ${
              darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper border-ink/20 shadow-sm"
            }`}
          >
            <div>
              <div className="p-3 rounded-full bg-teal-brand/10 text-teal-brand inline-flex mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="font-serif text-5xl font-bold text-teal-brand mb-2">
                <AnimatedCounter value={60} suffix="%" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink mb-1">Deployment Efficiency</h3>
              <p className="font-sans text-xs text-ink-muted leading-relaxed">
                Reduction in vector control response time via prioritized action engine.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 text-[11px] text-teal-brand font-bold">
              Optimized Municipal Action
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
