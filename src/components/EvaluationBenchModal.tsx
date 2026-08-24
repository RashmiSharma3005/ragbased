import React, { useState } from "react";
import { EvalBenchmark, DocumentItem, RetrievalConfig } from "../types";
import { EVAL_BENCHMARKS } from "../data/benchmarkQueries";
import { chunkDocuments, retrieveRelevantChunks, buildRetrievedContextPrompt } from "../utils/ragEngine";
import { auditAnswerGrounding, GroundingAudit } from "../utils/citationParser";
import {
  X,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  FileCheck,
} from "lucide-react";

interface EvaluationBenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  retrievalConfig: RetrievalConfig;
  temperature: number;
  onLoadBenchmarkQuery: (query: string) => void;
}

interface BenchmarkResult {
  benchmarkId: string;
  query: string;
  status: "pending" | "running" | "passed" | "partial" | "failed";
  audit?: GroundingAudit;
  answer?: string;
  notes?: string;
  latencyMs?: number;
}

export const EvaluationBenchModal: React.FC<EvaluationBenchModalProps> = ({
  isOpen,
  onClose,
  documents,
  retrievalConfig,
  temperature,
  onLoadBenchmarkQuery,
}) => {
  const [results, setResults] = useState<Record<string, BenchmarkResult>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeBenchmarkId, setActiveBenchmarkId] = useState<string | null>(null);

  if (!isOpen) return null;

  const runSingleBenchmark = async (benchmark: EvalBenchmark) => {
    setActiveBenchmarkId(benchmark.id);
    setResults((prev) => ({
      ...prev,
      [benchmark.id]: {
        benchmarkId: benchmark.id,
        query: benchmark.query,
        status: "running",
      },
    }));

    const startTime = performance.now();

    try {
      // 1. Chunk documents & retrieve
      const chunks = chunkDocuments(documents, retrievalConfig);
      const retrieved = retrieveRelevantChunks(benchmark.query, chunks, retrievalConfig);
      const contextString = buildRetrievedContextPrompt(retrieved);

      // 2. Call server endpoint
      const response = await fetch("/api/documind/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retrievedContext: contextString,
          userQuery: benchmark.query,
          temperature,
        }),
      });

      const data = await response.json();
      const answer = data.answer || "";
      const latencyMs = Math.round(performance.now() - startTime);

      // 3. Audit response against operational rules
      const audit = auditAnswerGrounding(answer, retrieved);

      let status: BenchmarkResult["status"] = "passed";
      let notes = "";

      if (benchmark.category === "absence") {
        if (audit.isAbsenceOfInfo) {
          status = "passed";
          notes = "Strict refusal standard sentence matched perfectly.";
        } else {
          status = "partial";
          notes = "Expected absence of info refusal, but answer was generated.";
        }
      } else if (benchmark.category === "conflict") {
        if (audit.hasConflictResolution && audit.citationCount >= 2) {
          status = "passed";
          notes = "Discrepancy noted and multiple conflicting sources cited.";
        } else {
          status = "partial";
          notes = "Conflict keywords or dual citations were not fully resolved.";
        }
      } else {
        if (audit.verifiedCitations > 0 && audit.unverifiedCitations === 0) {
          status = "passed";
          notes = `All ${audit.citationCount} citation(s) verified against retrieved source chunks.`;
        } else if (audit.citationCount === 0) {
          status = "partial";
          notes = "No citations detected in output.";
        } else {
          status = "partial";
          notes = `${audit.unverifiedCitations} citation(s) could not be mapped to retrieved chunks.`;
        }
      }

      setResults((prev) => ({
        ...prev,
        [benchmark.id]: {
          benchmarkId: benchmark.id,
          query: benchmark.query,
          status,
          audit,
          answer,
          notes,
          latencyMs,
        },
      }));
    } catch (err: any) {
      setResults((prev) => ({
        ...prev,
        [benchmark.id]: {
          benchmarkId: benchmark.id,
          query: benchmark.query,
          status: "failed",
          notes: err.message || "Failed to execute query",
        },
      }));
    } finally {
      setActiveBenchmarkId(null);
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    for (const b of EVAL_BENCHMARKS) {
      await runSingleBenchmark(b);
    }
    setIsRunningAll(false);
  };

  const passedCount = Object.values(results).filter((r) => r.status === "passed").length;
  const totalRun = Object.values(results).length;

  return (
    <div
      id="modal-eval-benchmark"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  DocuMind RAG Evaluation Benchmark
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  5 Core Rules
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated compliance test suite for Strict Grounding, Absence Handling, Citations, and Conflicts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Benchmark Conformance:{" "}
              <strong className="text-emerald-400 font-mono">
                {passedCount} / {totalRun || EVAL_BENCHMARKS.length} Passed
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isRunningAll}
              onClick={handleRunAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {isRunningAll ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Running All Benchmarks...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run All Tests
                </>
              )}
            </button>
          </div>
        </div>

        {/* Benchmarks List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {EVAL_BENCHMARKS.map((benchmark) => {
            const res = results[benchmark.id];
            const isRunning = activeBenchmarkId === benchmark.id || res?.status === "running";

            return (
              <div
                key={benchmark.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white">{benchmark.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          benchmark.category === "absence"
                            ? "bg-rose-950/80 text-rose-300 border border-rose-800/80"
                            : benchmark.category === "conflict"
                            ? "bg-amber-950/80 text-amber-300 border border-amber-800/80"
                            : benchmark.category === "multidoc"
                            ? "bg-purple-950/80 text-purple-300 border border-purple-800/80"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                        }`}
                      >
                        {benchmark.category}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-emerald-300/90 bg-slate-900/90 p-2 rounded border border-slate-800">
                      &ldquo;{benchmark.query}&rdquo;
                    </p>

                    <p className="text-[11px] text-slate-400">{benchmark.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={isRunning}
                        onClick={() => runSingleBenchmark(benchmark)}
                        className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Execute this benchmark test"
                      >
                        {isRunning ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{isRunning ? "Testing..." : "Test"}</span>
                      </button>

                      <button
                        onClick={() => {
                          onLoadBenchmarkQuery(benchmark.query);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-xs bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Load into Chat"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ask in Chat</span>
                      </button>
                    </div>

                    {res?.status && (
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded border ${
                          res.status === "passed"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                            : res.status === "partial"
                            ? "bg-amber-950 text-amber-300 border-amber-800"
                            : res.status === "running"
                            ? "bg-sky-950 text-sky-300 border-sky-800"
                            : "bg-rose-950 text-rose-300 border-rose-800"
                        }`}
                      >
                        {res.status === "passed" && <CheckCircle2 className="w-3 h-3" />}
                        {res.status === "partial" && <AlertTriangle className="w-3 h-3" />}
                        {res.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Audit Details */}
                {res && res.status !== "running" && (
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-300 font-medium">{res.notes}</span>
                      {res.latencyMs && (
                        <span className="text-slate-500 font-mono">{res.latencyMs}ms</span>
                      )}
                    </div>

                    {res.audit && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          Citations: <strong>{res.audit.citationCount}</strong> ({res.audit.verifiedCitations} verified)
                        </span>
                        {res.audit.isAbsenceOfInfo && (
                          <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
                            Absence Refusal Standard Phrase Verified
                          </span>
                        )}
                        {res.audit.hasConflictResolution && (
                          <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                            Conflict Resolution Detected
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Operational rules strictly validated across all benchmark runs.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
