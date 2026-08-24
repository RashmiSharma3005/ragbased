import React, { useState, useEffect } from "react";
import { DocumentItem } from "../types";
import {
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Bookmark,
  Sparkles,
} from "lucide-react";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  targetPage?: number;
  highlightText?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  targetPage = 1,
  highlightText,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(targetPage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (targetPage && document) {
      setCurrentPage(Math.min(targetPage, document.totalPages || 1));
    }
  }, [targetPage, document]);

  if (!isOpen || !document) return null;

  const activePageObj =
    document.pages.find((p) => p.pageNumber === currentPage) || document.pages[0];

  const handleCopyPage = () => {
    if (!activePageObj) return;
    const textToCopy = `[Source: ${document.filename}, Page ${currentPage}]\n${activePageObj.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render text with highlight
  const renderHighlightedContent = (content: string) => {
    if (!highlightText || highlightText.trim().length < 4) {
      return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
    }

    const searchWords = highlightText
      .toLowerCase()
      .replace(/[^\w\s$%.-]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

    if (searchWords.length === 0) {
      return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
    }

    // Split text into lines/paragraphs
    const lines = content.split("\n");

    return (
      <div className="space-y-2">
        {lines.map((line, lIdx) => {
          const lineLower = line.toLowerCase();
          const hasMatch = searchWords.some((w) => lineLower.includes(w));

          return (
            <p
              key={lIdx}
              className={`leading-relaxed transition-colors p-1.5 rounded ${
                hasMatch
                  ? "bg-amber-500/15 border-l-2 border-amber-400 text-amber-100 font-medium pl-2.5"
                  : "text-slate-200"
              }`}
            >
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id="modal-doc-viewer"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{document.title}</h3>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                  {document.filename}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grounding Document Inspector &bull; {document.category}
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

        {/* Page Selector Bar */}
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Pages:</span>
            {document.pages.map((p) => (
              <button
                key={p.pageNumber}
                onClick={() => setCurrentPage(p.pageNumber)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  currentPage === p.pageNumber
                    ? "bg-emerald-600 text-white shadow-sm font-semibold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Page {p.pageNumber}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPage}
              className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              title="Copy Page with [Source: ..., Page X] header"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Page</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-400 font-mono px-1">
                {currentPage} / {document.totalPages}
              </span>
              <button
                disabled={currentPage >= document.totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(document.totalPages, prev + 1))}
                className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-sans text-sm">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Verified Source Page: {currentPage}</span>
              </div>
              {highlightText && (
                <div className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
                  <Sparkles className="w-3 h-3" />
                  <span>Citation Context Active</span>
                </div>
              )}
            </div>

            {activePageObj ? (
              renderHighlightedContent(activePageObj.content)
            ) : (
              <p className="text-slate-500 italic">No content available for page {currentPage}.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>
            Citation Format:{" "}
            <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded">
              [Source: {document.filename}, Page {currentPage}]
            </code>
          </span>
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
