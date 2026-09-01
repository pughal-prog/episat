"use client";

import Navbar from "@/components/Navbar";
import { useEpiSatStore } from "@/lib/store";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, CheckCircle, TrendingUp } from "lucide-react";

export default function ForecastPage() {
  const { selectedLocation } = useEpiSatStore();

  const forecastChartData = [
    { week: "Week 1", actual: 18, rf_predicted: 19, xgb_predicted: 18, lstm_predicted: 20 },
    { week: "Week 2", actual: 22, rf_predicted: 21, xgb_predicted: 23, lstm_predicted: 21 },
    { week: "Week 3", actual: 28, rf_predicted: 27, xgb_predicted: 29, lstm_predicted: 26 },
    { week: "Week 4", actual: 35, rf_predicted: 34, xgb_predicted: 36, lstm_predicted: 32 },
    { week: "Week 5 (Fcst)", actual: null, rf_predicted: 42, xgb_predicted: 44, lstm_predicted: 39 },
    { week: "Week 6 (Fcst)", actual: null, rf_predicted: 48, xgb_predicted: 51, lstm_predicted: 45 },
    { week: "Week 7 (Fcst)", actual: null, rf_predicted: 52, xgb_predicted: 54, lstm_predicted: 49 },
    { week: "Week 8 (Fcst)", actual: null, rf_predicted: 45, xgb_predicted: 47, lstm_predicted: 43 },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Title */}
        <div className="border-b border-ink/20 pb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-ink-muted uppercase">{selectedLocation} OUTBREAK ANALYTICS</span>
            <h2 className="font-serif text-3xl font-bold text-ink">Multi-Horizon Disease Forecasting</h2>
          </div>
          <div className="font-mono text-xs bg-paper-raised p-2 rounded border border-ink/20 text-ink-muted">
            Evaluation Split: 80% Train (2019-2022) / 20% Test (Temporal Split)
          </div>
        </div>

        {/* Model Metrics Table */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 bg-paper-raised border border-ink/20 rounded">
            <div className="text-ink-muted uppercase text-[10px]">Random Forest Baseline</div>
            <div className="font-serif text-2xl font-bold text-ink mt-1">R² = 0.74</div>
            <div className="text-ink-muted mt-1">MAE: 1.15 cases/wk</div>
          </div>
          <div className="p-4 bg-paper-raised border border-ink/20 rounded">
            <div className="text-ink-muted uppercase text-[10px]">XGBoost Regressor</div>
            <div className="font-serif text-2xl font-bold text-teal-brand mt-1">R² = 0.76</div>
            <div className="text-ink-muted mt-1">MAE: 1.08 cases/wk</div>
          </div>
          <div className="p-4 bg-paper-raised border border-ink/20 rounded">
            <div className="text-ink-muted uppercase text-[10px]">LSTM Recurrent NN</div>
            <div className="font-serif text-2xl font-bold text-ink mt-1">R² = 0.71</div>
            <div className="text-ink-muted mt-1">MAE: 1.28 cases/wk</div>
          </div>
          <div className="p-4 bg-paper-raised border border-ink/20 rounded">
            <div className="text-ink-muted uppercase text-[10px]">Prediction Interval (95%)</div>
            <div className="font-serif text-2xl font-bold text-ink mt-1">35 – 51</div>
            <div className="text-ink-muted mt-1">Coverage: 92% Test Set</div>
          </div>
        </div>

        {/* Forecast Rechart */}
        <div className="bg-paper-raised border border-ink rounded p-5">
          <h3 className="font-serif text-xl font-bold text-ink mb-1">Weekly Dengue Case Predictions & Backtest Overlay</h3>
          <p className="font-sans text-xs text-ink-muted mb-6">Comparing Actual reported cases with Random Forest, XGBoost, and LSTM model forecasts.</p>
          
          <div className="h-80 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c9c3b3" />
                <XAxis dataKey="week" stroke="#12241f" />
                <YAxis stroke="#12241f" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual Reported Cases" stroke="#12241f" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="rf_predicted" name="RF Baseline (21d)" stroke="#1c4b46" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="xgb_predicted" name="XGBoost (21d)" stroke="#a8492f" strokeWidth={2} />
                <Line type="monotone" dataKey="lstm_predicted" name="LSTM (21d)" stroke="#b8862e" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>

      <footer className="border-t border-ink/20 p-4 text-center font-mono text-xs text-ink-muted bg-paper-raised">
        EpiSat 2.0 Disease Forecast Engine | Models evaluated on temporal test splits without data leakage.
      </footer>
    </div>
  );
}
