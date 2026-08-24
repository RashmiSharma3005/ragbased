import React, { useRef, useEffect } from "react";
import { ChatMessage, DocumentItem } from "../types";
import { ChatMessageItem } from "./ChatMessageItem";
import {
  Send,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  FileSearch,
  BookOpen,
  ArrowUpRight,
  AlertCircle,
  Cpu,
} from "lucide-react";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputQuery: string;
  setInputQuery: (query: string) => void;
  onSendMessage: (queryText?: string) => void;
  isLoading: boolean;
  documents: DocumentItem[];
  onOpenDocAtPage: (doc: DocumentItem, pageNum: number) => void;
  onOpenPromptInspector: () => void;
  onOpenBenchmark: () => void;
  onClearChat: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputQuery,
  setInputQuery,
  onSendMessage,
  isLoading,
  documents,
  onOpenDocAtPage,
  onOpenPromptInspector,
  onOpenBenchmark,
  onClearChat,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputQuery.trim() && !isLoading) {
        onSendMessage();
      }
    }
  };

  const samplePrompts = [
    {
      title: "Q4 Revenue & Margins",
      category: "Finance",
      query: "What were Apex Financial's net revenues and adjusted EBITDA performance for Q4 2025?",
    },
    {
      title: "Conflict Resolution Test",
      category: "Conflict Test",
      query: "What is NovaCloud's home office setup allowance and monthly connectivity stipend?",
    },
    {
      title: "Absence of Info Test",
      category: "Zero Hallucination",
      query: "What are Apex Financial's planned launch dates for quantum satellite terminals in 2035?",
    },
    {
      title: "Clinical Trial Criteria",
      category: "Clinical",
      query: "What is the dosing regimen for CardioZen CZ-302 and what are the specific criteria for treatment discontinuation?",
    },
  ];

  const activeDocs = documents.filter((d) => d.enabled);

  return (
    <div id="documind-chat-interface" className="flex flex-col h-full bg-slate-900 overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14 space-y-8">
            {/* Hero Header */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                DocuMind <span className="text-emerald-400">AI</span>
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                High-precision Retrieval-Augmented Generation assistant strictly grounded in your active documents with verified inline citations.
              </p>
            </div>

            {/* Core Operational Guarantees Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Strict Zero-Hallucination Grounding</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Answers rely strictly on indexed document context. If evidence is missing, the system explicitly reports absence of information.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <BookOpen className="w-4 h-4" />
                  <span>Interactive Source Citations</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Every claim is cited with <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">[Source: Doc, Page X]</code>, click-to-verify.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Discrepancy &amp; Conflict Resolution</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Contradictory snippets (e.g. policy revisions or addenda) are explicitly compared and cited side-by-side.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                  <Cpu className="w-4 h-4" />
                  <span>Multi-Doc Cross Synthesis</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Direct executive summary followed by structured bulleted breakdown with full prompt audit transparency.
                </p>
              </div>
            </div>

            {/* Quick Test Prompt Chips */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Curated Test Queries &amp; Benchmarks
                </span>
                <button
                  onClick={onOpenBenchmark}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                >
                  Run Full Eval Bench &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {samplePrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputQuery(item.query);
                      onSendMessage(item.query);
                    }}
                    className="p-3 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.query}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="divide-y divide-slate-800/60">
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                documents={documents}
                onOpenDocAtPage={onOpenDocAtPage}
                onOpenPromptInspector={onOpenPromptInspector}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="py-6 px-4 md:px-6 bg-slate-950/90 border-b border-slate-800/80">
                <div className="max-w-4xl mx-auto flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">DocuMind AI</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Retrieving &amp; Grounding...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <FileSearch className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span>Scanning active document pages, evaluating evidence, and formatting inline citations...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Composer Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Active Context Banner */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-300">
                <BookOpen className="w-3 h-3 text-emerald-400" />
                <span>
                  Corpus: <strong className="text-white">{activeDocs.length}</strong> active docs
                </span>
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-400 hidden sm:inline">
                Strict Grounding Active (Zero Extrapolation)
              </span>
            </div>

            {messages.length > 0 && (
              <button
                onClick={onClearChat}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>

          {/* Form Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputQuery.trim() && !isLoading) {
                onSendMessage();
              }
            }}
            className="relative bg-slate-900 border border-slate-700 focus-within:border-emerald-500 rounded-xl shadow-lg transition-colors overflow-hidden"
          >
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any question grounded in your documents (e.g. revenue stats, policy allowances, clinical dosing)..."
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">Enter</kbd> to ask, <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">Shift+Enter</kbd> for newline
              </span>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <span>Ask DocuMind</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
