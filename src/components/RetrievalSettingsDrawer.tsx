import React from "react";
import { RetrievalConfig } from "../types";
import { X, Sliders, RotateCcw, Info } from "lucide-react";

interface RetrievalSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: RetrievalConfig;
  onChangeConfig: (newConfig: RetrievalConfig) => void;
  temperature: number;
  onChangeTemperature: (temp: number) => void;
}

export const RetrievalSettingsDrawer: React.FC<RetrievalSettingsDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  temperature,
  onChangeTemperature,
}) => {
  if (!isOpen) return null;

  const handleResetDefaults = () => {
    onChangeConfig({
      topK: 4,
      minScore: 0.15,
      strategy: "hybrid",
      chunkStrategy: "page",
      chunkSize: 400,
      chunkOverlap: 60,
    });
    onChangeTemperature(0.1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-slate-900 border-l border-slate-700 w-full max-w-md h-full flex flex-col shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">RAG Engine Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Top-K Chunks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              Top-K Retrieved Chunks
            </label>
            <span className="font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
              {config.topK}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={config.topK}
            onChange={(e) => onChangeConfig({ ...config, topK: Number(e.target.value) })}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Maximum number of context snippets injected into the RETRIEVED CONTEXT block.
          </p>
        </div>

        {/* Setting 2: Min Score Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-200">
              Relevance Cutoff Threshold (Min Score)
            </label>
            <span className="font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
              {Math.round(config.minScore * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.60"
            step="0.05"
            value={config.minScore}
            onChange={(e) => onChangeConfig({ ...config, minScore: Number(e.target.value) })}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Chunks scoring below this threshold are discarded to prevent injecting irrelevant background noise.
          </p>
        </div>

        {/* Setting 3: Chunking Strategy */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-200">
            Indexing Chunk Granularity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "page", label: "By Page", desc: "Page-level chunks" },
              { id: "paragraph", label: "Paragraph", desc: "Section breaks" },
              { id: "fixed_sliding", label: "Sliding Window", desc: "Fixed tokens" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() =>
                  onChangeConfig({ ...config, chunkStrategy: opt.id as any })
                }
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  config.chunkStrategy === opt.id
                    ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-semibold">{opt.label}</div>
                <div className="text-[10px] text-slate-500">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Setting 4: Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-200">
              Model Temperature (Grounding Strictness)
            </label>
            <span className="font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
              {temperature}
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.5"
            step="0.05"
            value={temperature}
            onChange={(e) => onChangeTemperature(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Low temperature (0.0 – 0.1) enforces deterministic grounding and eliminates hallucinations.
          </p>
        </div>

        {/* Grounding System Rules Notice */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Info className="w-4 h-4" />
            <span>Active DocuMind System Directives</span>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li><strong className="text-slate-300">Rule 1 (Strict Grounding):</strong> Rely only on provided snippets.</li>
            <li><strong className="text-slate-300">Rule 2 (Absence of Info):</strong> Return standard refusal phrase if missing.</li>
            <li><strong className="text-slate-300">Rule 3 (Citations):</strong> Formatted as <code className="text-emerald-300">[Source: Doc, Page X]</code>.</li>
            <li><strong className="text-slate-300">Rule 4 (Conflict Resolution):</strong> Explicitly note contradictions.</li>
            <li><strong className="text-slate-300">Rule 5 (Structure):</strong> Direct summary followed by bulleted breakdown.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            Save &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
};
