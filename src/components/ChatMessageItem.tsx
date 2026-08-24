import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage, DocumentItem } from "../types";
import { CITATION_REGEX, extractCitations } from "../utils/citationParser";
import {
  ShieldCheck,
  User,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  AlertTriangle,
  FileText,
  Sparkles,
} from "lucide-react";

interface ChatMessageItemProps {
  message: ChatMessage;
  documents: DocumentItem[];
  onOpenDocAtPage: (doc: DocumentItem, pageNum: number) => void;
  onOpenPromptInspector: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  documents,
  onOpenDocAtPage,
  onOpenPromptInspector,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCitationClick = (rawCitation: string) => {
    const match = rawCitation.match(/\[Source:\s*([^,\]]+),\s*Page\s*([^\]]+)\]/i);
    if (!match) return;

    const docFilenameOrTitle = match[1].trim();
    const pageNum = parseInt(match[2].trim(), 10) || 1;

    const matchedDoc = documents.find(
      (d) =>
        d.filename.toLowerCase() === docFilenameOrTitle.toLowerCase() ||
        d.title.toLowerCase().includes(docFilenameOrTitle.toLowerCase())
    );

    if (matchedDoc) {
      onOpenDocAtPage(matchedDoc, pageNum);
    }
  };

  // Custom renderer for markdown text to replace citations with interactive clickable badges
  const transformCitationsToMarkdown = (text: string) => {
    // If user message, return as is
    if (message.role === "user") return text;

    // Replace [Source: File.pdf, Page X] with a recognizable markdown link format:
    // [Source: File.pdf, Page X](citation://File.pdf/X)
    return text.replace(
      CITATION_REGEX,
      (match, filename, page) =>
        `[${match}](citation://${encodeURIComponent(filename.trim())}/${page.trim()})`
    );
  };

  const isUser = message.role === "user";
  const citations = !isUser ? extractCitations(message.content) : [];

  return (
    <div
      className={`py-6 px-4 md:px-6 transition-colors ${
        isUser
          ? "bg-slate-900/40 border-b border-slate-800/40"
          : "bg-slate-950/80 border-b border-slate-800/80"
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
            isUser
              ? "bg-slate-800 border border-slate-700 text-slate-300"
              : "bg-emerald-700 text-white"
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {isUser ? "You" : "DocuMind AI"}
              </span>
              {!isUser && (
                <span className="text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  Grounding Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              {message.latencyMs && (
                <span className="font-mono">{message.latencyMs}ms</span>
              )}
              <button
                onClick={handleCopy}
                className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                title="Copy message content"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Message Markdown Body */}
          <div className="text-sm leading-relaxed text-slate-200 prose prose-invert max-w-none prose-headings:text-slate-100 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-emerald-300 prose-table:border prose-table:border-slate-800 prose-th:bg-slate-900 prose-td:border-slate-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  if (href?.startsWith("citation://")) {
                    const rawText = String(children);
                    return (
                      <button
                        type="button"
                        onClick={() => handleCitationClick(rawText)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-300 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700/80 px-2 py-0.5 rounded-md mx-1 my-0.5 transition-all shadow-xs cursor-pointer hover:border-emerald-500"
                        title="Click to view verified source document and page"
                      >
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span>{rawText}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </button>
                    );
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {transformCitationsToMarkdown(message.content)}
            </ReactMarkdown>
          </div>

          {/* Assistant Grounding Metadata Footer */}
          {!isUser && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {citations.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-slate-500 font-medium">Citations:</span>
                    {citations.map((c, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleCitationClick(c.raw)}
                        className="text-[10px] font-mono text-emerald-300 hover:text-white bg-slate-900 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        {c.docTitle} (p.{c.pageNumber})
                      </button>
                    ))}
                  </div>
                )}

                {message.hasConflictWarning && (
                  <span className="text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Contradiction Reconciled
                  </span>
                )}

                {message.isAbsenceOfInfo && (
                  <span className="text-[10px] font-medium bg-sky-950/80 text-sky-300 border border-sky-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Grounding Refusal Triggered
                  </span>
                )}
              </div>

              {message.retrievedChunks && message.retrievedChunks.length > 0 && (
                <button
                  onClick={onOpenPromptInspector}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3 h-3" />
                  <span>Inspect {message.retrievedChunks.length} Chunks</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
