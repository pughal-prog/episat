"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEpiSatStore } from "@/lib/store";
import { Floating3DAssistantCanvas } from "./Floating3DAssistantCanvas";
import {
  X, Send, Bot, Shield, User, BarChart2, Cpu, Database, Sparkles, AlertCircle, ChevronDown, CheckCircle, ExternalLink
} from "lucide-react";

export type PersonaType = "citizen" | "health_officer" | "analyst" | "admin";

interface MessageItem {
  id: string;
  sender: "user" | "bot";
  text: string;
  persona: PersonaType;
  sources?: string[];
  actionTrigger?: string | null;
  timestamp?: string;
}

export const Floating3DAIAssistant: React.FC = () => {
  const {
    selectedLocation, selectedDisease, toggleCitizenModal, toggleSimulator
  } = useEpiSatStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaType>("citizen");
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "init-1",
      sender: "bot",
      persona: "citizen",
      text: `Hello! I am your EpiSat 2.0 AI Assistant. I use Earth Observation satellite telemetry and machine learning to assist you with vector surveillance in ${selectedLocation}. Select your persona above to customize capabilities.`,
      sources: ["Sentinel-2 NDWI", "CHIRPS Rainfall Matrix", "EpiSat Grounding API"],
      timestamp: "Data observation timestamp: 2026-08-31 (Updated 3h ago)"
    }
  ]);

  // Read session storage open state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem("episat_assistant_open");
    if (savedState === "true") {
      setIsOpen(true);
    }
  }, []);

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    sessionStorage.setItem("episat_assistant_open", String(nextState));
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSendQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: MessageItem = {
      id: userMsgId,
      sender: "user",
      text: q,
      persona: activePersona
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          location_name: selectedLocation,
          persona: activePersona,
          disease: selectedDisease
        })
      });

      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const json = await res.json().catch(() => null);
        if (json?.success && json?.data) {
          const botMsg: MessageItem = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: json.data.answer,
            persona: activePersona,
            sources: json.data.sources_used,
            actionTrigger: json.data.action_trigger,
            timestamp: json.data.timestamp
          };
          setMessages((prev) => [...prev, botMsg]);

          // Auto-trigger UI modal if requested by backend tool
          if (json.data.action_trigger === "OPEN_CITIZEN_REPORT_MODAL") {
            toggleCitizenModal();
          } else if (json.data.action_trigger === "OPEN_SIMULATOR_MODAL") {
            toggleSimulator();
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              sender: "bot",
              persona: activePersona,
              text: "The required data is not available.",
              sources: ["EpiSat Intelligence Engine"]
            }
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "bot",
            persona: activePersona,
            text: "Unable to connect to EpiSat intelligence backend."
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          persona: activePersona,
          text: "Unable to connect to EpiSat intelligence backend."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Chips per Persona
  const getSuggestions = () => {
    switch (activePersona) {
      case "citizen":
        return [
          "What is the dengue risk in my area?",
          "Report stagnant water",
          "How to read risk map colors?",
          "Disease prevention guidance"
        ];
      case "health_officer":
        return [
          "Why is Ward 42 high risk?",
          "Which wards should be prioritized?",
          "What happens if rainfall increases 20%?",
          "Generate priority risk report"
        ];
      case "analyst":
        return [
          "Show model MAE & XGBoost vs RF",
          "How current is Sentinel-2 layer?",
          "Satellite feature ablation contribution"
        ];
      case "admin":
        return [
          "System pipeline health status",
          "All active wards risk summary",
          "Data staleness check"
        ];
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 1. FLOATING 3D ICON BUTTON (Collapsed State) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={toggleOpen}
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 45 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            className="group relative w-16 h-16 rounded-full bg-paper-raised border-2 border-teal-brand shadow-2xl flex items-center justify-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-brand/40 overflow-hidden"
            aria-label="Open EpiSat 3D AI Assistant"
            title="EpiSat 3D AI Assistant (Multi-Persona)"
          >
            {/* 3D Canvas Satellite Render */}
            <div className="w-14 h-14">
              <Floating3DAssistantCanvas size={56} />
            </div>

            {/* Glowing Pulse Ring */}
            <span className="absolute inset-0 rounded-full border border-teal-brand/50 animate-ping opacity-20 pointer-events-none" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-paper rounded-full shadow" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. CHAT PANEL CONTAINER (Expanded State) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full sm:w-[420px] h-[85vh] max-h-[640px] bg-paper-raised border-2 border-ink shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden sm:fixed sm:bottom-6 sm:right-6"
          >
            {/* Panel Header */}
            <div className="p-3.5 bg-paper border-b border-ink/20 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-brand/10 border border-teal-brand/30 flex items-center justify-center">
                  <Floating3DAssistantCanvas size={32} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink flex items-center gap-1.5">
                    EpiSat AI Assistant
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-brand/20 text-teal-brand">
                      3D v2.0
                    </span>
                  </h3>
                  <p className="text-[10px] font-mono text-ink-muted">Grounding API • Multi-Persona RBAC</p>
                </div>
              </div>
              <button
                onClick={toggleOpen}
                className="p-1 text-ink-muted hover:text-risk-critical rounded transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Persona Selector Bar */}
            <div className="px-3 py-2 bg-paper-raised border-b border-ink/10 flex items-center justify-between text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-ink-muted flex items-center gap-1">
                <User className="w-3 h-3 text-teal-brand" /> Persona:
              </span>
              <div className="flex items-center space-x-1">
                {[
                  { id: "citizen", label: "Citizen", icon: Shield },
                  { id: "health_officer", label: "Officer", icon: User },
                  { id: "analyst", label: "Analyst", icon: BarChart2 },
                  { id: "admin", label: "Admin", icon: Cpu }
                ].map((p) => {
                  const IconComp = p.icon;
                  const isActive = activePersona === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActivePersona(p.id as PersonaType)}
                      className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-all ${
                        isActive
                          ? "bg-teal-brand text-paper font-bold shadow-sm"
                          : "bg-paper text-ink hover:bg-paper-raised border border-ink/20"
                      }`}
                    >
                      <IconComp className="w-3 h-3" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs font-sans">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-xl border shadow-sm ${
                      m.sender === "user"
                        ? "bg-ink text-paper border-ink rounded-br-none"
                        : "bg-paper text-ink border-ink/20 rounded-bl-none"
                    }`}
                  >
                    {/* Persona Badge */}
                    {m.sender === "bot" && (
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-ink/10 text-[10px] font-mono text-teal-brand font-semibold">
                        <span className="uppercase tracking-wider">[{m.persona.replace("_", " ")}] Mode</span>
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                    {/* Sources Used */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-ink/10 font-mono text-[10px] text-ink-muted">
                        <div className="flex items-center font-semibold mb-1 text-teal-brand">
                          <Database className="w-3 h-3 mr-1" /> Data Sources Used:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {m.sources.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-paper-raised border border-ink/10 rounded text-[9px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    {m.timestamp && (
                      <div className="mt-1.5 text-[9px] font-mono text-ink-muted italic">
                        {m.timestamp}
                      </div>
                    )}

                    {/* Action Trigger Button */}
                    {m.actionTrigger === "OPEN_CITIZEN_REPORT_MODAL" && (
                      <button
                        onClick={toggleCitizenModal}
                        className="mt-2.5 w-full py-1.5 px-3 bg-teal-brand text-paper font-mono text-xs font-bold rounded flex items-center justify-center gap-1.5 hover:bg-teal-deep transition-colors shadow"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Launch Stagnant Water Report Tool
                      </button>
                    )}
                    {m.actionTrigger === "OPEN_SIMULATOR_MODAL" && (
                      <button
                        onClick={toggleSimulator}
                        className="mt-2.5 w-full py-1.5 px-3 bg-amber-500 text-paper font-mono text-xs font-bold rounded flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-colors shadow"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Launch What-If Scenario Simulator
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2 font-mono text-xs text-ink-muted italic p-2 bg-paper rounded border border-ink/10">
                  <div className="w-3 h-3 rounded-full bg-teal-brand animate-ping" />
                  <span>Consulting EpiSat ground telemetry & AI models…</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="p-2 bg-paper-raised border-t border-ink/10 flex flex-wrap gap-1">
              {getSuggestions().map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(chip)}
                  className="px-2 py-1 bg-paper border border-ink/20 hover:border-teal-brand text-[10px] font-mono text-ink rounded-full transition-colors truncate max-w-full"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-paper border-t border-ink/20 flex items-center space-x-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
                placeholder={`Ask as ${activePersona.replace("_", " ")} about ${selectedLocation}...`}
                className="flex-1 bg-paper-raised border border-ink/30 px-3 py-2 text-xs font-mono text-ink rounded-lg focus:outline-none focus:border-teal-brand"
              />
              <button
                onClick={() => handleSendQuery()}
                disabled={loading || !inputQuery.trim()}
                className="p-2 bg-teal-brand text-paper rounded-lg hover:bg-teal-deep disabled:opacity-50 transition-colors shadow"
                aria-label="Send Query"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
