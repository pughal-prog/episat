"use client";

import { useState } from "react";
import { useEpiSatStore } from "@/lib/store";
import { X, Send, Bot, User, Database } from "lucide-react";

export default function EpiSatAssistant() {
  const { isAssistantOpen, toggleAssistant, selectedLocation } = useEpiSatStore();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string; sources?: string[] }>>([
    {
      sender: "bot",
      text: `Hello! I am the EpiSat Public Health AI Assistant. Ask me anything about risk factors, outbreak forecasts, or priority interventions in ${selectedLocation}.`,
      sources: ["Sentinel-2 NDWI", "CHIRPS Rainfall Matrix", "RF-v2 Forecast Engine"]
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isAssistantOpen) return null;

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, location_name: selectedLocation })
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const json = await res.json().catch(() => null);
        if (json?.success) {
          setMessages(prev => [...prev, { sender: "bot", text: json.data.answer, sources: json.data.sources_used }]);
        } else {
          setMessages(prev => [...prev, { sender: "bot", text: "The required data is not available." }]);
        }
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "Unable to connect to EpiSat intelligence backend." }]);
      }
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "Unable to connect to EpiSat intelligence backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-paper-raised border-l-2 border-ink shadow-2xl z-50 flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 border-b border-ink/20 flex items-center justify-between bg-paper">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-teal-brand" />
          <h3 className="font-serif font-bold text-lg text-ink">EpiSat AI Assistant</h3>
        </div>
        <button onClick={toggleAssistant} className="p-1 text-ink hover:text-risk-critical">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded border ${
              m.sender === "user" ? "bg-ink text-paper border-ink" : "bg-paper text-ink border-ink/20"
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              {m.sources && (
                <div className="mt-2 pt-2 border-t border-ink/10 font-mono text-[10px] text-ink-muted">
                  <div className="flex items-center font-semibold mb-1">
                    <Database className="w-3 h-3 mr-1" /> Data Sources Used:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {m.sources.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="font-mono text-xs text-ink-muted italic">Consulting EpiSat structured feature store…</div>}
      </div>

      {/* Input Footer */}
      <div className="p-4 border-t border-ink/20 bg-paper flex items-center space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Ask about ${selectedLocation} risk factors...`}
          className="flex-1 bg-paper-raised border border-ink/30 px-3 py-2 text-xs font-mono text-ink rounded focus:outline-none focus:border-teal-brand"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-teal-brand text-paper rounded hover:bg-teal-deep transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
