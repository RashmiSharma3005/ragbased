import React, { useState } from "react";
import { DocumentItem } from "../types";
import {
  X,
  Plus,
  Trash2,
  FileText,
  RotateCcw,
  CheckSquare,
  Square,
  Search,
  Eye,
  Layers,
  Upload,
} from "lucide-react";

interface DocumentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onToggleDoc: (id: string) => void;
  onAddDoc: (doc: DocumentItem) => void;
  onDeleteDoc: (id: string) => void;
  onResetDocs: () => void;
  onSelectDocPreview: (doc: DocumentItem, pageNum?: number) => void;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  isOpen,
  onClose,
  documents,
  onToggleDoc,
  onAddDoc,
  onDeleteDoc,
  onResetDocs,
  onSelectDocPreview,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isCreating, setIsCreating] = useState(false);

  // New Doc Form
  const [newTitle, setNewTitle] = useState("");
  const [newFilename, setNewFilename] = useState("");
  const [newCategory, setNewCategory] = useState<DocumentItem["category"]>("Custom");
  const [newDescription, setNewDescription] = useState("");
  const [newRawText, setNewRawText] = useState("");

  if (!isOpen) return null;

  const categories = [
    "All",
    "Finance",
    "Legal",
    "HR & Operations",
    "Healthcare & Clinical",
    "Engineering & Tech",
    "Custom",
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFilename.trim() || !newRawText.trim()) return;

    // Parse pages delimited by e.g. "--- Page X ---" or split by ~1200 characters
    let pages: Array<{ pageNumber: number; content: string }> = [];
    const pageDelimiterRegex = /(?:^|\n)---\s*(?:Page\s*(\d+)|\d+)\s*---(?:\n|$)/i;

    if (pageDelimiterRegex.test(newRawText)) {
      const splits = newRawText.split(/(?:^|\n)---\s*(?:Page\s*\d+|\d+)\s*---(?:\n|$)/i);
      pages = splits
        .filter((s) => s.trim().length > 0)
        .map((content, idx) => ({
          pageNumber: idx + 1,
          content: content.trim(),
        }));
    } else {
      // Auto-chunk into pages of ~1000 characters if no delimiters
      const paragraphs = newRawText.split(/\n\s*\n/);
      let currentPage = 1;
      let currentContent = "";

      for (const para of paragraphs) {
        if (currentContent.length + para.length > 900 && currentContent.length > 0) {
          pages.push({ pageNumber: currentPage, content: currentContent.trim() });
          currentPage++;
          currentContent = para + "\n\n";
        } else {
          currentContent += para + "\n\n";
        }
      }
      if (currentContent.trim()) {
        pages.push({ pageNumber: currentPage, content: currentContent.trim() });
      }
    }

    if (pages.length === 0) {
      pages = [{ pageNumber: 1, content: newRawText.trim() }];
    }

    const newDoc: DocumentItem = {
      id: `doc-custom-${Date.now()}`,
      title: newTitle.trim(),
      filename: newFilename.endsWith(".pdf") || newFilename.endsWith(".txt") || newFilename.endsWith(".md")
        ? newFilename.trim()
        : `${newFilename.trim()}.pdf`,
      category: newCategory,
      description: newDescription.trim() || `User created document with ${pages.length} page(s).`,
      totalPages: pages.length,
      pages,
      uploadedAt: new Date().toISOString(),
      enabled: true,
    };

    onAddDoc(newDoc);
    setIsCreating(false);
    setNewTitle("");
    setNewFilename("");
    setNewDescription("");
    setNewRawText("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewFilename(file.name);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || "";
      setNewRawText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="modal-doc-manager"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Document Knowledge Base
            </h2>
            <p className="text-xs text-slate-400">
              Manage corpus documents, page breakdowns, and active retrieval targets.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search documents by title, filename, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {isCreating ? "Cancel" : "Add / Upload Doc"}
              </button>

              <button
                onClick={onResetDocs}
                className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="Reset to default benchmark documents"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white font-medium shadow-sm"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Creation Form (Collapsible) */}
          {isCreating && (
            <form
              onSubmit={handleCreateDocument}
              className="bg-slate-950/90 border border-emerald-500/30 p-5 rounded-xl space-y-4 shadow-lg animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Create or Upload New Document
                </h3>
                <span className="text-[11px] text-slate-400">
                  Tip: Use <code className="text-emerald-300">--- Page 2 ---</code> to designate pages.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q1 Global Security Policy"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Filename (with extension) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Security_Policy_2026.pdf"
                    value={newFilename}
                    onChange={(e) => setNewFilename(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="HR & Operations">HR & Operations</option>
                    <option value="Healthcare & Clinical">Healthcare & Clinical</option>
                    <option value="Engineering & Tech">Engineering & Tech</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Brief Summary / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Key compliance requirements, data encryption SLAs, and incident protocols."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-300">
                    Document Text Content (Paste or Upload .txt/.md/.pdf text) *
                  </label>
                  <label className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Select Local Text File
                    <input
                      type="file"
                      accept=".txt,.md,.json,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  required
                  rows={6}
                  placeholder={`Paste document text here. Example with page delimiters:

SECTION 1: OVERVIEW
NovaCloud implements multi-region disaster recovery...

--- Page 2 ---
SECTION 2: BACKUP SCHEDULE
Backups run every 6 hours with 30-day retention...`}
                  value={newRawText}
                  onChange={(e) => setNewRawText(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Index &amp; Save Document
                </button>
              </div>
            </form>
          )}

          {/* Document List Cards */}
          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No documents match the filter criteria</p>
                <p className="text-xs text-slate-600 mt-1">Try changing search keywords or category filters.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border transition-all ${
                    doc.enabled
                      ? "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      : "bg-slate-950/30 border-slate-800/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => onToggleDoc(doc.id)}
                        className="mt-0.5 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        title={doc.enabled ? "Exclude from retrieval corpus" : "Include in retrieval corpus"}
                      >
                        {doc.enabled ? (
                          <CheckSquare className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-600" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">{doc.title}</h4>
                          <span className="text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                            {doc.category}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/50">
                            {doc.filename}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{doc.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            {doc.totalPages} {doc.totalPages === 1 ? "page" : "pages"}
                          </span>
                          <span>
                            Indexed: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                          <span className={doc.enabled ? "text-emerald-400" : "text-amber-500/80"}>
                            {doc.enabled ? "Active in RAG Context" : "Disabled (Excluded)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectDocPreview(doc, 1)}
                        className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Preview Document Content & Pages"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      {doc.id.startsWith("doc-custom") && (
                        <button
                          onClick={() => onDeleteDoc(doc.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete Custom Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div>
            Total active documents:{" "}
            <span className="font-semibold text-white">
              {documents.filter((d) => d.enabled).length} of {documents.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
