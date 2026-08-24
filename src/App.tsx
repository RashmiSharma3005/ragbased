import React, { useState, useEffect, useMemo } from "react";
import { DocumentItem, RetrievalConfig, ChatMessage, RetrievedResult } from "./types";
import { DEFAULT_DOCUMENTS } from "./data/defaultDocuments";
import {
  chunkDocuments,
  retrieveRelevantChunks,
  buildRetrievedContextPrompt,
  formatFullPromptPayload,
} from "./utils/ragEngine";
import { auditAnswerGrounding } from "./utils/citationParser";
import { Navbar } from "./components/Navbar";
import { ChatInterface } from "./components/ChatInterface";
import { RetrievedContextViewer } from "./components/RetrievedContextViewer";
import { DocumentManagerModal } from "./components/DocumentManagerModal";
import { DocumentViewerModal } from "./components/DocumentViewerModal";
import { RetrievalSettingsDrawer } from "./components/RetrievalSettingsDrawer";
import { EvaluationBenchModal } from "./components/EvaluationBenchModal";

const STORAGE_KEY_DOCS = "documind_documents_v1";

export default function App() {
  // 1. Documents State
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOCS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse saved docs:", e);
    }
    return DEFAULT_DOCUMENTS;
  });

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    } catch (e) {
      console.error("Failed to persist documents:", e);
    }
  }, [documents]);

  // 2. Retrieval Configuration
  const [retrievalConfig, setRetrievalConfig] = useState<RetrievalConfig>({
    topK: 4,
    minScore: 0.15,
    strategy: "hybrid",
    chunkStrategy: "page",
    chunkSize: 400,
    chunkOverlap: 60,
  });
  const [temperature, setTemperature] = useState<number>(0.1);

  // 3. Chat Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // 4. Modals and Drawers
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [showPromptInspector, setShowPromptInspector] = useState(false);

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewHighlight, setPreviewHighlight] = useState<string>("");

  // RAG Inspector Context Tracking
  const [currentRetrievedChunks, setCurrentRetrievedChunks] = useState<RetrievedResult[]>([]);
  const [currentRawContext, setCurrentRawContext] = useState<string>("");
  const [currentPromptPayload, setCurrentPromptPayload] = useState<string>("");
  const [currentUserQuery, setCurrentUserQuery] = useState<string>("");

  // Total indexed chunks computed dynamically
  const allIndexedChunks = useMemo(() => {
    return chunkDocuments(documents, retrievalConfig);
  }, [documents, retrievalConfig]);

  // Check backend server health
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch((err) => {
        console.warn("Backend health check failed:", err);
      });
  }, []);

  // Handlers for Document Management
  const handleToggleDoc = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const handleAddDoc = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleResetDocs = () => {
    setDocuments(DEFAULT_DOCUMENTS);
    localStorage.removeItem(STORAGE_KEY_DOCS);
  };

  // Open Document Viewer
  const handleOpenDocAtPage = (doc: DocumentItem, pageNum: number, highlight?: string) => {
    setPreviewDoc(doc);
    setPreviewPage(pageNum);
    setPreviewHighlight(highlight || "");
  };

  // Core Send Query Handler
  const handleSendMessage = async (customQuery?: string) => {
    const queryToSend = (customQuery || inputQuery).trim();
    if (!queryToSend || isLoading) return;

    setInputQuery("");
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: queryToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentUserQuery(queryToSend);

    const startTime = performance.now();

    try {
      // 1. High-precision hybrid retrieval over active chunks
      const activeChunks = chunkDocuments(documents, retrievalConfig);
      const retrieved = retrieveRelevantChunks(queryToSend, activeChunks, retrievalConfig);
      const contextString = buildRetrievedContextPrompt(retrieved);
      const payloadString = formatFullPromptPayload(contextString, queryToSend);

      setCurrentRetrievedChunks(retrieved);
      setCurrentRawContext(contextString);
      setCurrentPromptPayload(payloadString);

      // 2. Call backend server endpoint
      const response = await fetch("/api/documind/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retrievedContext: contextString,
          userQuery: queryToSend,
          temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer || "";
      const latencyMs = Math.round(performance.now() - startTime);

      // 3. Grounding Audit
      const audit = auditAnswerGrounding(answer, retrieved);

      const assistantMessage: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
        timestamp: new Date().toISOString(),
        retrievedContext: contextString,
        retrievedChunks: retrieved,
        promptPayload: payloadString,
        citations: audit.citations,
        model: data.model || "gemini-3.7-flash",
        latencyMs,
        hasConflictWarning: audit.hasConflictResolution,
        isAbsenceOfInfo: audit.isAbsenceOfInfo,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Query generation error:", error);

      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: `### Error Processing Query\nAn unexpected error occurred while communicating with the DocuMind server:\n\`\`\`\n${
          error.message || "Unknown network error"
        }\n\`\`\`\nPlease verify your connection and retry.`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setCurrentRetrievedChunks([]);
    setCurrentRawContext("");
    setCurrentPromptPayload("");
  };

  const activeDocCount = documents.filter((d) => d.enabled).length;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        activeDocCount={activeDocCount}
        totalChunkCount={allIndexedChunks.length}
        hasApiKey={hasApiKey}
        onOpenDocManager={() => setIsDocManagerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenPromptInspector={() => setShowPromptInspector(!showPromptInspector)}
        showInspector={showPromptInspector}
      />

      {/* Main Workspace Area (Dual-Pane if Inspector open) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Main: Chat Interface */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <ChatInterface
            messages={messages}
            inputQuery={inputQuery}
            setInputQuery={setInputQuery}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            documents={documents}
            onOpenDocAtPage={handleOpenDocAtPage}
            onOpenPromptInspector={() => setShowPromptInspector(true)}
            onOpenBenchmark={() => setIsBenchmarkOpen(true)}
            onClearChat={handleClearChat}
          />
        </main>

        {/* Right Pane: RAG Context & Prompt Inspector (Collapsible) */}
        {showPromptInspector && (
          <aside className="w-full sm:w-96 lg:w-[440px] h-full shrink-0 border-l border-slate-800 bg-slate-900 z-20">
            <RetrievedContextViewer
              retrievedChunks={currentRetrievedChunks}
              rawRetrievedContext={currentRawContext}
              userQuery={currentUserQuery}
              promptPayload={currentPromptPayload}
              onSelectDocPreview={(doc, page) => handleOpenDocAtPage(doc, page || 1)}
              documents={documents}
              onManualContextChange={(newContext) => setCurrentRawContext(newContext)}
            />
          </aside>
        )}
      </div>

      {/* Modals & Drawers */}
      <DocumentManagerModal
        isOpen={isDocManagerOpen}
        onClose={() => setIsDocManagerOpen(false)}
        documents={documents}
        onToggleDoc={handleToggleDoc}
        onAddDoc={handleAddDoc}
        onDeleteDoc={handleDeleteDoc}
        onResetDocs={handleResetDocs}
        onSelectDocPreview={(doc, page) => {
          handleOpenDocAtPage(doc, page || 1);
        }}
      />

      <DocumentViewerModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        targetPage={previewPage}
        highlightText={previewHighlight}
      />

      <RetrievalSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={retrievalConfig}
        onChangeConfig={setRetrievalConfig}
        temperature={temperature}
        onChangeTemperature={setTemperature}
      />

      <EvaluationBenchModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        documents={documents}
        retrievalConfig={retrievalConfig}
        temperature={temperature}
        onLoadBenchmarkQuery={(query) => {
          setInputQuery(query);
          handleSendMessage(query);
        }}
      />
    </div>
  );
}
