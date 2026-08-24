import React, { useState } from "react";
import { RetrievedResult, DocumentItem } from "../types";
import {
  Layers,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
} from "lucide-react";

interface RetrievedContextViewerProps {
  retrievedChunks: RetrievedResult[];
  rawRetrievedContext: string;
  userQuery: string;
  promptPayload: string;
  onSelectDocPreview: (doc: DocumentItem, pageNum?: number) => void;
  documents: DocumentItem[];
  onManualContextChange?: (newContext: string) => void;
}

export const RetrievedContextViewer: React.FC<RetrievedContextViewerProps> = ({
  retrievedChunks,
  rawRetrievedContext,
  userQuery,
  promptPayload,
  onSelectDocPreview,
  documents,
  onManualContextChange,
}) => {
  const [activeTab, setActiveTab] = useState<"chunks" | "raw_context" | "full_payload">("chunks");
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleOpenDoc = (chunk: RetrievedResult["chunk"]) => {
    const matchedDoc = documents.find((d) => d.id === chunk.docId || d.filename === chunk.filename);
    if (matchedDoc) {
      onSelectDocPreview(matchedDoc, chunk.pageNumber);
    }
  };

  return (
    <div
      id="rag-inspector-panel"
      className="bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden w-full text-slate-200"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
            RAG Context Inspector
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          {retrievedChunks.length} Chunks Retrieved
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 pt-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950/60 text-xs">
        <button
          onClick={() => setActiveTab("chunks")}
          className={`pb-2 px-2 border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === "chunks"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Retrieved Chunks ({retrievedChunks.length})
        </button>

        <button
          onClick={() => setActiveTab("raw_context")}
          className={`pb-2 px-2 border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === "raw_context"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          RETRIEVED CONTEXT Block
        </button>

        <button
          onClick={() => setActiveTab("full_payload")}
          className={`pb-2 px-2 border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === "full_payload"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Full Prompt Payload
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* TAB 1: RETRIEVED CHUNKS */}
        {activeTab === "chunks" && (
          <div className="space-y-3">
            {retrievedChunks.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Layers className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="font-medium text-slate-400">No chunks retrieved yet</p>
                <p className="mt-1">Submit a question in the chat to trigger the hybrid RAG retrieval pipeline.</p>
              </div>
            ) : (
              retrievedChunks.map((item, idx) => {
                const isExpanded = expandedChunkId === item.chunk.id || idx === 0;

                return (
                  <div
                    key={item.chunk.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-slate-700 transition-colors"
                  >
                    {/* Chunk Header */}
                    <div className="p-3 bg-slate-900/80 flex items-center justify-between gap-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-100 truncate">
                            {item.chunk.filename}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Page {item.chunk.pageNumber} &bull; ~{item.chunk.estimatedTokens} tokens
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                            item.score >= 0.7
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : item.score >= 0.4
                              ? "bg-sky-950 text-sky-300 border-sky-800"
                              : "bg-amber-950 text-amber-300 border-amber-800"
                          }`}
                        >
                          {Math.round(item.score * 100)}% match
                        </span>

                        <button
                          onClick={() => handleOpenDoc(item.chunk)}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Open Document at this Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() =>
                            setExpandedChunkId(isExpanded ? null : item.chunk.id)
                          }
                          className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Matched Tokens Bar */}
                    {item.matchedTerms.length > 0 && (
                      <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800/50 flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="text-slate-500 font-medium">Matched terms:</span>
                        {item.matchedTerms.map((term, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Chunk Text */}
                    {isExpanded && (
                      <div className="p-3 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/40">
                        <div className="text-emerald-400/90 font-semibold mb-1 text-[11px]">
                          [Source: {item.chunk.filename}, Page {item.chunk.pageNumber}]
                        </div>
                        {item.chunk.text}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: RAW RETRIEVED CONTEXT BLOCK */}
        {activeTab === "raw_context" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict Format Specification</span>
              </div>
              <button
                onClick={() => handleCopy(rawRetrievedContext, "context")}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                {copied === "context" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Context</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={16}
              value={rawRetrievedContext}
              onChange={(e) => onManualContextChange && onManualContextChange(e.target.value)}
              className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-emerald-200/90 focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
              placeholder="Retrieved context block will populate here..."
            />
          </div>
        )}

        {/* TAB 3: FULL PROMPT PAYLOAD */}
        {activeTab === "full_payload" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Exact Model Input Payload</span>
              </div>
              <button
                onClick={() => handleCopy(promptPayload, "payload")}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                {copied === "payload" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {promptPayload ||
                `RETRIEVED CONTEXT:\n---\n${rawRetrievedContext || "No context"}\n---\n\nUSER QUERY:\n${
                  userQuery || "No query submitted yet"
                }`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
