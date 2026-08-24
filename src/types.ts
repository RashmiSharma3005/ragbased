export interface DocumentPage {
  pageNumber: number;
  content: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  category: "Finance" | "Legal" | "HR & Operations" | "Healthcare & Clinical" | "Engineering & Tech" | "Custom";
  description: string;
  totalPages: number;
  pages: DocumentPage[];
  uploadedAt: string;
  enabled: boolean;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  filename: string;
  pageNumber: number;
  text: string;
  charCount: number;
  estimatedTokens: number;
}

export interface RetrievedResult {
  chunk: DocumentChunk;
  score: number;
  matchedTerms: string[];
}

export interface RetrievalConfig {
  topK: number;
  minScore: number;
  strategy: "hybrid" | "bm25" | "semantic";
  chunkStrategy: "page" | "paragraph" | "fixed_sliding";
  chunkSize: number;
  chunkOverlap: number;
}

export interface CitationMeta {
  raw: string; // e.g. "[Source: Apex_10K_2025.pdf, Page 4]"
  docTitle: string;
  pageNumber: string;
  chunkId?: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  retrievedContext?: string;
  retrievedChunks?: RetrievedResult[];
  promptPayload?: string;
  citations?: CitationMeta[];
  model?: string;
  latencyMs?: number;
  hasConflictWarning?: boolean;
  isAbsenceOfInfo?: boolean;
}

export interface EvalBenchmark {
  id: string;
  title: string;
  category: "grounding" | "absence" | "conflict" | "multidoc" | "adversarial";
  query: string;
  description: string;
  targetDocIds: string[];
  expectedBehavior: string;
}
