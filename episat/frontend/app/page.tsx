import Link from "next/link";
import { ArrowRight, Satellite, ShieldCheck, Activity, Brain, Eye, MapPin, Users, ChevronRight, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-ink/20 px-8 py-5 flex items-center justify-between bg-paper-raised">
        <div className="flex items-center space-x-3">
          <h1 className="font-serif text-2xl font-bold text-ink">EpiSat <span className="font-mono text-xs px-2 py-0.5 bg-teal-brand text-paper rounded">2.0</span></h1>
          <span className="font-mono text-xs text-ink-muted hidden sm:inline">| SIH 2026 Space Technology</span>
        </div>
        <div className="flex items-center space-x-4 font-mono text-xs">
          <Link href="/dashboard" className="px-4 py-2 bg-teal-brand text-paper rounded font-medium hover:bg-teal-deep transition-colors flex items-center space-x-1.5">
            <span>Launch Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-20 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-teal-brand/10 border border-teal-brand/30 rounded-full font-mono text-xs text-teal-brand mb-6">
          <Zap className="w-3.5 h-3.5 text-teal-brand" />
          <span>Space-to-Action AI Platform for Hyperlocal Early Warning</span>
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-ink mb-6 leading-tight">
          Predict outbreaks <br />
          <span className="italic text-teal-brand font-serif">before they spread.</span>
        </h1>
        <p className="font-sans text-lg text-ink-muted max-w-3xl mx-auto mb-10 leading-relaxed">
          EpiSat combines Earth Observation, weather data, machine learning, and explainable AI to detect environmental vector-breeding suitability and forecast dengue risk 1–4 weeks ahead of clinical surge.
        </p>

        <div className="flex flex-wrap justify-center gap-4 font-mono text-sm">
          <Link href="/dashboard" className="px-6 py-3.5 bg-teal-brand text-paper font-semibold rounded hover:bg-teal-deep shadow-md transition-all flex items-center space-x-2">
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#how-it-works" className="px-6 py-3.5 bg-paper border border-ink text-ink font-semibold rounded hover:bg-paper-raised transition-colors">
            Explore Technology
          </a>
        </div>
      </section>

      {/* Live Preview Grid */}
      <section className="px-8 py-12 max-w-6xl mx-auto w-full">
        <div className="bg-paper-raised border-2 border-ink rounded-lg p-6 shadow-xl font-mono">
          <div className="flex items-center justify-between border-b border-ink/20 pb-3 mb-4">
            <span className="text-xs uppercase text-ink-muted font-bold">Hyperlocal 500m Grid Risk Snapshot — Chennai</span>
            <span className="text-xs text-teal-brand font-bold">LIVE MODEL INFERENCE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-paper border border-ink/20 rounded">
              <div className="text-[10px] text-ink-muted uppercase">Ward 42 (South)</div>
              <div className="font-serif text-2xl font-bold text-risk-critical mt-1">87 / 100</div>
              <div className="text-[11px] text-risk-critical font-bold">CRITICAL RISK</div>
              <div className="text-[10px] text-ink-muted mt-1">+35% Rain Anomaly</div>
            </div>
            <div className="p-4 bg-paper border border-ink/20 rounded">
              <div className="text-[10px] text-ink-muted uppercase">Ward 18 (Central)</div>
              <div className="font-serif text-2xl font-bold text-risk-high mt-1">78 / 100</div>
              <div className="text-[11px] text-risk-high font-bold">HIGH RISK</div>
              <div className="text-[10px] text-ink-muted mt-1">+27% NDWI Water</div>
            </div>
            <div className="p-4 bg-paper border border-ink/20 rounded">
              <div className="text-[10px] text-ink-muted uppercase">Ward 24 (East)</div>
              <div className="font-serif text-2xl font-bold text-risk-medium mt-1">54 / 100</div>
              <div className="text-[11px] text-risk-medium font-bold">MODERATE RISK</div>
              <div className="text-[10px] text-ink-muted mt-1">29.4°C LST Temp</div>
            </div>
            <div className="p-4 bg-paper border border-ink/20 rounded">
              <div className="text-[10px] text-ink-muted uppercase">Ward 35 (West)</div>
              <div className="font-serif text-2xl font-bold text-risk-low mt-1">38 / 100</div>
              <div className="text-[11px] text-risk-low font-bold">LOW RISK</div>
              <div className="text-[10px] text-ink-muted mt-1">Baseline Standard</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Pipeline Section */}
      <section id="how-it-works" className="px-8 py-16 bg-paper-raised border-y border-ink/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-ink">Space-to-Action AI Pipeline</h2>
            <p className="font-sans text-sm text-ink-muted mt-2">Connecting multi-source remote sensing directly to public health decision support</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans text-xs">
            <div className="p-5 bg-paper border border-ink/20 rounded">
              <Satellite className="w-6 h-6 text-teal-brand mb-3" />
              <h3 className="font-serif font-bold text-sm text-ink mb-1">1. Earth Observation</h3>
              <p className="text-ink-muted leading-relaxed">
                Sentinel-2 NDWI (standing water), NASA MODIS LST (surface temp), and CHIRPS precipitation ingested weekly.
              </p>
            </div>
            <div className="p-5 bg-paper border border-ink/20 rounded">
              <Activity className="w-6 h-6 text-teal-brand mb-3" />
              <h3 className="font-serif font-bold text-sm text-ink mb-1">2. Anomaly & BSI Models</h3>
              <p className="text-ink-muted leading-relaxed">
                Computes Z-score baseline anomalies and Mosquito Breeding Suitability Index (BSI: 0-100) per 500m cell.
              </p>
            </div>
            <div className="p-5 bg-paper border border-ink/20 rounded">
              <Brain className="w-6 h-6 text-teal-brand mb-3" />
              <h3 className="font-serif font-bold text-sm text-ink mb-1">3. AI Risk Forecasting</h3>
              <p className="text-ink-muted leading-relaxed">
                Multi-horizon Random Forest & XGBoost models forecast dengue risk 1–4 weeks ahead with prediction intervals.
              </p>
            </div>
            <div className="p-5 bg-paper border border-ink/20 rounded">
              <ShieldCheck className="w-6 h-6 text-teal-brand mb-3" />
              <h3 className="font-serif font-bold text-sm text-ink mb-1">4. Action Engine</h3>
              <p className="text-ink-muted leading-relaxed">
                SHAP XAI factor breakdown recommends prioritized vector control interventions to public health officers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/20 px-8 py-6 text-center font-mono text-xs text-ink-muted">
        EpiSat 2.0 — Developed for Smart India Hackathon (SIH 2026) | Scientific Positioning: Environmental breeding suitability early warning.
      </footer>
    </div>
  );
}
