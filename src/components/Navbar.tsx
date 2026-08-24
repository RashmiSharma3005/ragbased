import React from "react";
import {
  FileText,
  Sliders,
  Sparkles,
  BookOpen,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface NavbarProps {
  activeDocCount: number;
  totalChunkCount: number;
  hasApiKey: boolean | null;
  onOpenDocManager: () => void;
  onOpenSettings: () => void;
  onOpenBenchmark: () => void;
  onOpenPromptInspector: () => void;
  showInspector: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeDocCount,
  totalChunkCount,
  hasApiKey,
  onOpenDocManager,
  onOpenSettings,
  onOpenBenchmark,
  onOpenPromptInspector,
  showInspector,
}) => {
  return (
    <header
      id="documind-navbar"
      className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 shadow-md"
    >
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center shadow-inner">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              DocuMind <span className="text-emerald-400 font-semibold">AI</span>
            </h1>
            <span className="text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Strict RAG Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            High-Precision Grounded Assistant &amp; Citation Engine
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden md:flex items-center gap-2 text-xs bg-slate-800/80 border border-slate-700/70 px-3 py-1.5 rounded-lg">
        <div className="flex items-center gap-1.5 text-slate-300">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-white">{activeDocCount}</span> docs active
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5 text-slate-300">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-white">{totalChunkCount}</span> indexed chunks
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5">
          {hasApiKey ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Gemini 3.7 Flash
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-300" title="API Key not configured, running deterministic local RAG engine">
              <AlertCircle className="w-3.5 h-3.5" /> Deterministic RAG Engine
            </span>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2">
        <button
          id="btn-eval-benchmark"
          onClick={onOpenBenchmark}
          className="flex items-center gap-1.5 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          title="Run RAG Compliance Benchmark Suite"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Eval Benchmark</span>
        </button>

        <button
          id="btn-manage-docs"
          onClick={onOpenDocManager}
          className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Documents</span>
        </button>

        <button
          id="btn-prompt-inspector"
          onClick={onOpenPromptInspector}
          className={`flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            showInspector
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
          }`}
          title="Toggle Context & Prompt Inspector"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RAG Inspector</span>
        </button>

        <button
          id="btn-retrieval-settings"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          title="Configure Retrieval Parameters"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
